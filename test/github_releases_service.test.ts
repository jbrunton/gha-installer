import {GitHubReleasesService} from '../src/github_releases_service'
import {ActionsCore} from '../src/interfaces'
import {mock} from 'jest-mock-extended'
import {ReposListReleasesItem} from '../src/octokit'
import {TestOctokit, createTestOctokit} from './fixtures/test_octokit'
import {DownloadService} from '../src/download_service'

describe('GitHubReleasesService', () => {
  const repo = {owner: 'k14s', repo: 'ytt'}

  function createService(
    octokit: TestOctokit = createTestOctokit()
  ): GitHubReleasesService {
    const core = mock<ActionsCore>()
    return new GitHubReleasesService(core, octokit, repo, 'ytt-linux-amd64')
  }

  function releaseJsonFor(app: string, version: string): ReposListReleasesItem {
    return {
      tag_name: version,
      assets: [
        {
          browser_download_url: `https://example.com/k14s/ytt/releases/download/${version}/${app}-linux-amd64`,
          name: `${app}-linux-amd64`
        }
      ]
    } as ReposListReleasesItem
  }

  describe('getDownloadInfoForAsset()', () => {
    let service: DownloadService
    let octokit: TestOctokit

    function stubListReleasesResponse(releases: Array<ReposListReleasesItem>) {
      octokit.stubListReleasesResponse(repo, releases)
    }

    beforeEach(() => {
      octokit = createTestOctokit()
      service = createService(octokit)
    })

    test('it returns the asset for the specific version', async () => {
      stubListReleasesResponse([
        releaseJsonFor('ytt', '0.28.0'),
        releaseJsonFor('ytt', '0.27.0')
      ])
      const downloadInfo = await service.getDownloadInfo({
        name: 'ytt',
        version: '0.27.0'
      })
      expect(downloadInfo).toEqual({
        version: '0.27.0',
        url: 'https://example.com/k14s/ytt/releases/download/0.27.0/ytt-linux-amd64'
       })
    })

    test('it works with any valid semver format', async () => {
      stubListReleasesResponse([
        releaseJsonFor('ytt', '0.28.0'),
        releaseJsonFor('ytt', '0.27.0')
      ])
      const downloadInfo = await service.getDownloadInfo(
        {
          name: 'ytt',
          version: 'v0.27.0' // note the "v" prefix
        }
      )
      expect(downloadInfo).toEqual({
        version: '0.27.0',
        url:
          'https://example.com/k14s/ytt/releases/download/0.27.0/ytt-linux-amd64'
      })
    })

    test('it returns the latest version', async () => {
      stubListReleasesResponse([
        releaseJsonFor('ytt', '0.1.2'), // check we ignore patches for older versions
        releaseJsonFor('ytt', '0.28.0'),
        releaseJsonFor('ytt', '0.27.0')
      ])
      const downloadInfo = await service.getDownloadInfo(
        {
          name: 'ytt',
          version: 'latest'
        }
      )
      expect(downloadInfo).toEqual({
        version: '0.28.0',
        url:
          'https://example.com/k14s/ytt/releases/download/0.28.0/ytt-linux-amd64'
      })
    })

    test('errors if it cannot find the version', async () => {
      stubListReleasesResponse([
        releaseJsonFor('ytt', '0.28.0'),
        releaseJsonFor('ytt', '0.27.0')
      ])
      const result = service.getDownloadInfo(
        {
          name: 'ytt',
          version: 'not-a-version'
        }
      )
      await expect(result).rejects.toThrowError(
        'Could not find version "not-a-version" for ytt'
      )
    })
  })

  describe('sortReleases()', () => {
    test('it sorts non-semver names last', () => {
      const service = createService(createTestOctokit())
      const releases = [
        releaseJsonFor('ytt', '0.1.2'),
        releaseJsonFor('ytt', 'v0.28.0'),
        releaseJsonFor('ytt', 'not-semver-tag'),
        releaseJsonFor('ytt', '0.27.0')
      ]

      const orderedResults = service['sortReleases'](releases).map(
        result => result.tag_name
      )

      expect(orderedResults).toEqual([
        'v0.28.0',
        '0.27.0',
        '0.1.2',
        'not-semver-tag'
      ])
    })
  })
})
