import { Installer } from '../src/installer'
import { mock, MockProxy } from 'jest-mock-extended'
import { ActionsCore } from '../src/adapters/core'
import { ActionsToolCache } from '../src/adapters/cache'
import { FileSystem } from '../src/adapters/fs'
import { DownloadInfoService, DownloadInfo } from '../src/download_info'

describe('Installer', () => {
  const app = { name: "ytt", version: "0.28.0" }
  const assetNames = {
    linux: "ytt-linux-amd64",
    win32: "ytt-windows-amd64.exe"
  }
  const downloadUrls = {
    linux: "example.com/ytt/0.28.0/ytt-linux-amd64",
    win32: "example.com/ytt/0.28.0/ytt-windows-amd64.exe"
  }
  const downloadPaths = {
    linux: "/downloads/ytt-linux-amd64",
    win32: "/downloads/ytt-windows-amd64.exe"
  }
  const binPaths = {
    linux: "/bin/ytt",
    win32: "/bin/ytt.exe"
  }

  let installer: Installer
  let core: MockProxy<ActionsCore>
  let cache: MockProxy<ActionsToolCache>
  let fs: MockProxy<FileSystem>

  beforeEach(() => {
    core = mock<ActionsCore>()
    cache = mock<ActionsToolCache>()
    fs = mock<FileSystem>()   
  })

  function createInstaller(platform: "win32" | "linux"): Installer {
    const env = { platform: platform }
    const downloadInfoService = mock<DownloadInfoService>()
    installer = new Installer(core, cache, fs, env, downloadInfoService)

    const downloadInfo: DownloadInfo = {
      version: "0.28.0",
      url: downloadUrls[platform],
      assetName: assetNames[platform],
      releaseNotes: "* some cool stuff"
    }
    downloadInfoService.getDownloadInfo
      .calledWith(app)
      .mockReturnValue(Promise.resolve(downloadInfo))
    
    return installer
  }

  test("it installs a new app on nix systems", async () => {
    const installer = createInstaller('linux')
    cache.downloadTool
      .calledWith(downloadUrls.linux)
      .mockReturnValue(Promise.resolve(downloadPaths.linux))
    cache.cacheFile
      .calledWith(downloadPaths.linux, "ytt", "ytt", "0.28.0")
      .mockReturnValue(Promise.resolve(binPaths.linux))

    await installer.installApp(app)

    expect(core.info).toHaveBeenCalledWith("Downloading ytt 0.28.0 from example.com/ytt/0.28.0/ytt-linux-amd64")
    expect(fs.chmodSync).toHaveBeenCalledWith(downloadPaths.linux, "755")
    expect(core.addPath).toHaveBeenCalledWith(binPaths.linux)
  })

  test('it installs a new app on windows', async () => {
    const installer = createInstaller('win32')
    cache.downloadTool
      .calledWith(downloadUrls.win32)
      .mockReturnValue(Promise.resolve(downloadPaths.win32))
    cache.cacheFile
      .calledWith(downloadPaths.win32, "ytt.exe", "ytt.exe", "0.28.0")
      .mockReturnValue(Promise.resolve(binPaths.win32))
    
    await installer.installApp(app)

    expect(core.info).toHaveBeenCalledWith("Downloading ytt 0.28.0 from example.com/ytt/0.28.0/ytt-windows-amd64.exe")
    expect(fs.chmodSync).toHaveBeenCalledWith(downloadPaths.win32, "755")
    expect(core.addPath).toHaveBeenCalledWith(binPaths.win32)
  })

  test("it adds a cached app to the path on nix systems", async () => {
    const installer = createInstaller('linux')
    cache.find.calledWith("ytt", "0.28.0").mockReturnValue(binPaths.linux)

    await installer.installApp(app)

    expect(core.info).toHaveBeenCalledWith("ytt 0.28.0 already in tool cache")
    expect(cache.downloadTool).not.toHaveBeenCalled()
    expect(core.addPath).toHaveBeenCalledWith(binPaths.linux)
  })

  test("it adds a cached app to the path on windows", async () => {
    const installer = createInstaller('win32')
    cache.find.calledWith("ytt.exe", "0.28.0").mockReturnValue(binPaths.win32)

    await installer.installApp(app)

    expect(core.info).toHaveBeenCalledWith("ytt 0.28.0 already in tool cache")
    expect(cache.downloadTool).not.toHaveBeenCalled()
    expect(core.addPath).toHaveBeenCalledWith(binPaths.win32)
  })

  test('it calls onFileDownloaded if given', async () => {
    const installer = createInstaller('linux')
    cache.downloadTool
      .calledWith(downloadUrls.linux)
      .mockReturnValue(Promise.resolve(downloadPaths.linux))
    cache.cacheFile
      .calledWith(downloadPaths.linux, "ytt", "ytt", "0.28.0")
      .mockReturnValue(Promise.resolve(binPaths.linux))
    
    const onFileDownloaded = (path: string, info: DownloadInfo, core: ActionsCore) => {
      throw new Error(`Invalid checksum for ${info.assetName}`)
    }

    const result = installer.installApp(app, onFileDownloaded)

    await expect(result).rejects.toThrowError('Invalid checksum for ytt-linux-amd64')
  })
})
