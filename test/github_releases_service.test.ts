import {GitHubReleasesService} from '../src/github_releases_service'
import {ActionsCore} from '../src/interfaces'
import {mock} from 'jest-mock-extended'
import {ReposListReleasesItem} from '../src/octokit'
import {TestOctokit, createTestOctokit} from './fixtures/test_octokit'
import {DownloadInfoService} from '../src/download_info'

describe('DownloadInfoService', () => {
  const repo = { owner: 'k14s', repo: 'ytt' }

  function createService(
    platform: string,
    octokit: TestOctokit = createTestOctokit()
  ) {
    const core = mock<ActionsCore>()
    return new GitHubReleasesService(core, octokit)
  }

  function releaseJsonFor(app: string, version: string): ReposListReleasesItem {
    return {
      name: version,
      assets: [
        {
          browser_download_url: `https://example.com/k14s/ytt/releases/download/v${version}/ytt-darwin-amd64`,
          name: `${app}-linux-amd64`
        }
      ]
    } as ReposListReleasesItem
  }

  describe('getDownloadInfoForAsset()', () => {
    let service: DownloadInfoService
    let octokit: TestOctokit

    function stubListReleasesResponse(releases: Array<ReposListReleasesItem>) {
      const params = {owner: 'k14s', repo: 'ytt'}
      octokit.stubListReleasesResponse(params, releases)
    }

    beforeEach(() => {
      octokit = createTestOctokit()
      service = createService('linux', octokit)
    })

    test('it returns the asset for the specific version, if given', async () => {
      stubListReleasesResponse([
        releaseJsonFor('ytt', '0.28.0'),
        releaseJsonFor('ytt', '0.27.0')
      ])
      const downloadInfo = await service.getDownloadInfo({
        name: 'ytt',
        version: '0.27.0'
      }, repo, 'ytt-linux-amd64')
      expect(downloadInfo).toEqual({
        version: '0.27.0',
        url:
          'https://example.com/k14s/ytt/releases/download/v0.27.0/ytt-darwin-amd64',
        assetName: 'ytt-linux-amd64',
        releaseNotes: undefined
      })
    })

    test('it returns the latest version', async () => {
      stubListReleasesResponse([
        releaseJsonFor('ytt', '0.1.2'), // check we ignore patches for older versions
        releaseJsonFor('ytt', '0.28.0'),
        releaseJsonFor('ytt', '0.27.0')
      ])
      const downloadInfo = await service.getDownloadInfo({
        name: 'ytt',
        version: 'latest'
      }, repo, 'ytt-linux-amd64')
      expect(downloadInfo).toEqual({
        version: '0.28.0',
        url:
          'https://example.com/k14s/ytt/releases/download/v0.28.0/ytt-darwin-amd64',
        assetName: 'ytt-linux-amd64',
        releaseNotes: undefined
      })
    })

    test('errors if it cannot find the version', async () => {
      stubListReleasesResponse([
        releaseJsonFor('ytt', '0.28.0'),
        releaseJsonFor('ytt', '0.27.0')
      ])
      const result = service.getDownloadInfo({
        name: 'ytt',
        version: 'not-a-version'
      }, repo, 'ytt-linux-amd64')
      await expect(result).rejects.toThrowError(
        'Could not find version "not-a-version" for ytt'
      )
    })
  })

  describe('sortReleases()', () => {
    test('it sorts non-semver names last', () => {
      const service = createService('linux', createTestOctokit())
      const releases = [
        releaseJsonFor('ytt', '0.1.2'),
        releaseJsonFor('ytt', '0.28.0'),
        releaseJsonFor('ytt', '0.2.0 - initial release'), // some apps have a "0.1.0 - initial release" version
        releaseJsonFor('ytt', '0.27.0')
      ]

      const orderedResults = service['sortReleases'](releases).map(
        result => result.name
      )

      expect(orderedResults).toEqual([
        '0.28.0',
        '0.27.0',
        '0.1.2',
        '0.2.0 - initial release'
      ])
    })
  })
})
