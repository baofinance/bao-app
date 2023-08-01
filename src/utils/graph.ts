import { ApolloClient, gql, InMemoryCache } from '@apollo/client'
//import { BigNumber } from 'ethers'

import Config from '@/bao/lib/config'

// TODO- Move Apollo Clients to provider so that the chain can be switched
const clients: any = Object.keys(Config.subgraphs).reduce((prev, current) => {
	const _clients = Object.keys(Config.subgraphs[current]).reduce((_prev, _current: string) => {
		return {
			..._prev,
			[_current]: {
				client: new ApolloClient({
					uri: Config.subgraphs[current][parseInt(_current)],
					cache: new InMemoryCache(),
				}),
			},
		}
	}, {})
	return {
		...prev,
		[current]: {
			..._clients,
		},
	}
}, {})

const _getClient = (clientName: string, network: number) => clients[clientName][network].client

const _querySubgraph = (query: string, clientName = 'aura', networkId = Config.networkId, _client?: ApolloClient<any>) => {
	const client = _client || _getClient(clientName, networkId)
	return new Promise((resolve, reject) => {
		client
			.query({
				query: gql(query),
			})
			.then(({ data }: any) => resolve(data))
			.catch((err: any) => reject(err))
	})
}

const getAuraPool = async (poolId: string): Promise<any> => {
	const data: any = await _querySubgraph(_getAuraPoolQuery(poolId), 'aura', 1)
	return {
		apr: data.pool.aprs.total,
		tvl: data.pool.tvl,
	}
}

const _getAuraPoolQuery = (poolId: string) =>
	`
	{
		pool (chainId: 1, id:"${poolId}" ){
		  address
		  tvl
		  aprs {
			 total
		  }
		}
	  }
`

// eslint-disable-next-line import/no-anonymous-default-export
export default {
	getAuraPool,
}
