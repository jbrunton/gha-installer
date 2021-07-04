import {
  Octokit,
  OctokitResponse,
  
  ReposListReleasesItem,
  ReposListReleasesParameters,
  ReposListReleasesResponse,
  ReposListReleasesResponseData
} from '../../src/octokit';
import { MockProxy, mockDeep } from 'jest-mock-extended';
import { isEqual } from './matchers'

interface TestMethods {
  stubListReleasesResponse(params: ReposListReleasesParameters, releases: Array<ReposListReleasesItem>): void
}

export type TestOctokit = MockProxy<Octokit> & TestMethods

export function createTestOctokit(): TestOctokit {
  const octokit: any = mockDeep<Octokit>()
  octokit.stubListReleasesResponse = stubListReleasesResponse
  return octokit as TestOctokit
}

function stubListReleasesResponse(this: TestOctokit, params: ReposListReleasesParameters, releases: Array<ReposListReleasesItem>) {
  const response = { data: releases } as ReposListReleasesResponse
  this.rest.repos.listReleases
    .calledWith(isEqual(params))
    .mockReturnValue(Promise.resolve(response as any))
}
