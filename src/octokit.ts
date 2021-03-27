import {GitHub} from '@actions/github/lib/utils'
import {Endpoints} from '@octokit/types'

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never

// list releases types
export type ReposListReleasesParameters = Endpoints['GET /repos/{owner}/{repo}/releases']['parameters']
export type ReposListReleasesResponse = Endpoints['GET /repos/{owner}/{repo}/releases']['response']
export type ReposListReleasesResponseData = ReposListReleasesResponse['data']
export type ReposListReleasesItem = ArrayElement<ReposListReleasesResponseData>

// Octokit
export {OctokitResponse} from '@octokit/types'
export type Octokit = InstanceType<typeof GitHub>
