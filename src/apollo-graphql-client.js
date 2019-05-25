import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import gql from 'graphql-tag';
import { getMainDefinition } from 'apollo-utilities';

export { gql }

// This is an extension of the default Appollo client. With websocket support. Cache disabled. And authorization.

// There should be no need to edit this file

export default class MyApolloClient extends ApolloClient {

  constructor(uri, wsUri, authorization) {

    const wsLink = new WebSocketLink({
      uri: wsUri,
      options: {
        reconnect: true,
        connectionParams: {
          Authorization: authorization
        }
      }
    })

    const httpLink = new HttpLink({ uri })

    const splitLink = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      wsLink,
      httpLink,
    )

    const contextLink = setContext((_, { headers }) => {
      return {
        headers: {
          ...headers,
          Authorization: authorization
        }
      }
    })

    const link = contextLink.concat(splitLink)

    super({
      link,
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'network-only',
          errorPolicy: 'all',
        },
        query: {
          fetchPolicy: 'network-only',
          errorPolicy: 'all',
        },
        mutate: {
          errorPolicy: 'all'
        }
      }
    })
  }
}