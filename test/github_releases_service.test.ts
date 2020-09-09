import {GitHubReleasesService} from '../src/github_releases_service'
import {ActionsCore} from '../src/interfaces'
import {mock} from 'jest-mock-extended'
import {ReposListReleasesItem} from '../src/octokit'
import {TestOctokit, createTestOctokit} from './fixtures/test_octokit'

describe('GitHubReleasesService', () => {
  const repo = {owner: 'k14s', repo: 'ytt'}

  function createService(
    platform: string,
    octokit: TestOctokit = createTestOctokit()
  ): GitHubReleasesService {
    const core = mock<ActionsCore>()
    return new GitHubReleasesService(core, {platform: platform}, octokit, {
      repo: repo,
      assetName: 'ytt-linux-amd64'
    })
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
    let service: GitHubReleasesService
    let octokit: TestOctokit

    function stubListReleasesResponse(releases: Array<ReposListReleasesItem>) {
      octokit.stubListReleasesResponse(repo, releases)
    }

    beforeEach(() => {
      octokit = createTestOctokit()
      service = createService('linux', octokit)
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
        url:
          'https://example.com/k14s/ytt/releases/download/0.27.0/ytt-linux-amd64',
        meta: {
          release: releaseJsonFor('ytt', '0.27.0')
        }
      })
    })
  })
})
