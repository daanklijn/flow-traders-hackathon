
import Client, { gql } from './apollo-graphql-client'


// Fill in your token here
const TOKEN = null

if (!TOKEN) alert("No api token set. Insert your personal token in api.js!")

const authorization = "Bearer " + TOKEN
const uri = "https://traders.madx.nl"
const wsUri = "wss://traders.madx.nl/graphql"

// Create our api client
const client = new Client(uri, wsUri, authorization)

/**
 * Starts a subscription on the active game
 */
export function activeGameSubscription() {

  return client.subscribe({
    query: SUBSCRIPTION_GAME_QUERY,
  })
}

/**
 * Start a subscription on news items
 */
export function newsSubscription() {

  return client.subscribe({
    query: SUBSCRIPTION_NEWS_QUERY,
  })
}

/**
 * Manually retrieves the game from the server
 */
export async function getGame() {

  const { data, errors } = await client.query({
    query: GAME_QUERY,
  })

  throwErrors(errors)

  return data.activeGame
}

/**
 * Manually retrieves the lates news from the server
 */
export async function getNews() {

  const { data, errors } = await client.query({
    query: NEWS_QUERY,
  })

  throwErrors(errors)

  return data.news
}

/**
 * Places a buy order at the server which will be executed when shares are 
 * below the given target.
 * 
 * @param {string} companyId The company id
 * @param {number} amount The amount of shares to buy
 * @param {number} target The target price to buy shares for
 */
export async function placeBuyOrder(companyId, amount, target) {

  const { data, errors } = await client.mutate({
    mutation: BUY_QUERY,
    variables: {
      companyId: companyId,
      amount: getAmount(amount),
      target: getTarget(target),
    }
  })

  throwErrors(errors)

  return data.placeBuyOrder.id
}

/**
 * Places an immediate buy order which will be processed in the next game cycle.
 * 
 * @param {string} companyId The company id
 * @param {number} amount The amount of shares to buy
 */
export async function placeImmediateBuyOrder(companyId, amount) {

  const { data, errors } = await client.mutate({
    mutation: BUY_IMMEDIATE_QUERY,
    variables: {
      companyId: companyId,
      amount: getAmount(amount),
    }
  })

  throwErrors(errors)

  return data.placeImmediateBuyOrder.id
}

/**
 * Places a sell order at the server which will be executed when shares are 
 * above the given target.
 * 
 * @param {string} companyId The company id
 * @param {number} amount The amount of shares to sell
 * @param {number} target The target price to sell shares for
 */
export async function placeSellOrder(companyId, amount, target) {

  const { data, errors } = await client.mutate({
    mutation: SELL_QUERY,
    variables: {
      companyId: companyId,
      amount: getAmount(amount),
      target: getTarget(target),
    }
  })

  throwErrors(errors)

  return data.placeSellOrder.id
}

/**
 * Places an immediate sell order which will be processed in the next game cycle.
 * 
 * @param {string} companyId The company id
 * @param {number} amount The amount of shares to sell
 */
export async function placeImmediateSellOrder(companyId, amount) {

  const { data, errors } = await client.mutate({
    mutation: SELL_IMMEDIATE_QUERY,
    variables: {
      companyId: companyId,
      amount: getAmount(amount),
    }
  })

  throwErrors(errors)

  return data.placeImmediateSellOrder.id
}

/**
 * Cancels an order immediately
 * 
 * @param {string} orderId The order id
 */
export async function cancelOrder(orderId) {

  const { data, errors } = await client.mutate({
    mutation: CANCEL_QUERY,
    variables: {
      orderId: orderId
    }
  })

  throwErrors(errors)

  return data.cancelOrder.id
}

function getAmount(amountStr) {
  const amount = parseInt(amountStr, 10)
  if (isNaN(amount) || amount <= 0 || amount > 100)
    throw new Error("Amount must be > 0 and <= 100")
  return amount
}

function getTarget(targetStr) {
  const target = parseFloat(targetStr)
  if (isNaN(target) || target <= 0)
    throw new Error("Target must be > 0")
  return target
}

function throwErrors(errors) {
  // We prefer to have the error thrown instead of checking for the error field each time
  if (errors) {
    throw new Error("Server error: " + errors[0].message)
  }
}

// The query definitions (what to get from the uri), feel free to change this to your needs

const GAME_QUERY = gql`{
  activeGame {
    id
    name
    player {
      name
      email
      capital
      shares {
        amount
        company {
          name
          id
          value
        }
      }
      orders {
        id
        type
        amount
        target
        state
        company {
          name
          id
          value
        }
      }
    }
    companies {
      id
      key
      name
      logo
      value
      sectorKey
      sectorName
    }
  }
}`

const SUBSCRIPTION_GAME_QUERY = gql`subscription {
  activeGame {
    id
    name
    player {
      name
      email
      capital
      shares {
        amount
        company {
          name
          id
          value
        }
      }
      orders {
        id
        type
        amount
        target
        state
        company {
          name
          id
          value
        }
      }
    }
    companies {
      id
      key
      name
      logo
      value
      sectorKey
      sectorName
    }
  }
}
`
const NEWS_QUERY = gql`{
  news {
    id
    source
    headline
    content
    image
    releasedAt
  }
}
`
const SUBSCRIPTION_NEWS_QUERY = gql`subscription {
  news {
    id
    source
    headline
    content
    image
    releasedAt
  }
}
`

const BUY_QUERY = gql`mutation ($companyId: ID!, $amount: Int!, $target: Float!) {
  placeBuyOrder(companyId: $companyId, amount: $amount, target: $target) {
    id
  }
}`

const BUY_IMMEDIATE_QUERY = gql`mutation ($companyId: ID!, $amount: Int!) {
  placeImmediateBuyOrder(companyId: $companyId, amount: $amount) {
    id
  }
}`

const SELL_QUERY = gql`mutation ($companyId: ID!, $amount: Int!, $target: Float!) {
  placeSellOrder(companyId: $companyId, amount: $amount, target: $target) {
    id
  }
}`

const SELL_IMMEDIATE_QUERY = gql`mutation ($companyId: ID!, $amount: Int!) {
  placeImmediateSellOrder(companyId: $companyId, amount: $amount) {
    id
  }
}`

const CANCEL_QUERY = gql`mutation ($orderId: ID!) {
  cancelOrder(orderId: $orderId) {
    id
  }
}`