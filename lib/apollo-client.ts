// import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client"
// import { setContext } from "@apollo/client/link/context"

// const httpLink = createHttpLink({
//   uri: "http://localhost:8080/query",
// })

// const authLink = setContext((_, { headers }) => {
//   const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

//   return {
//     headers: {
//       ...headers,
//       authorization: token ? `Bearer ${token}` : "",
//     },
//   }
// })

// export const apolloClient = new ApolloClient({
//   link: from([authLink, httpLink]),
//   cache: new InMemoryCache(),
// })

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const httpLink = createHttpLink({
  uri: "http://localhost:8080/query",
  credentials: "same-origin",
  fetchOptions: {
    mode: "cors",
  },
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
        alert(message)
      });
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
      console.log("Operation:", operation);
      console.log("Headers:", operation.getContext().headers);
    }
  }
);

const authLink = setContext((_, { headers }) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          groupsByUserID: {
            merge: false,
          },
          itemsByGroupID: {
            merge: false,
          },
          eventsByGroupID: {
            merge: false,
          },
          membersByGroupID: {
            merge: false,
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
    },
    query: {
      fetchPolicy: "network-only",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});
