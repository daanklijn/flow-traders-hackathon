<template>
  <div>
    <h1>Have fun @ Coding MADness!</h1>
    <p>Welcome: {{ name }}!</p>
    <button @click="buy()">Buy 1 share of ING</button>
    <h2>Latest news:</h2>
    <p>{{news}}</p>
  </div>
</template>

<script>
import * as api from "../api";

export default {
  name: "HelloWorld",

  data: () => ({
    name: "[waiting for server]",
    companyId: null,
    news: "No latest news yet!"
  }),

  methods: {
    async buy() {
      if (this.companyId) {
        try {
          const id = await api.placeImmediateBuyOrder(this.companyId, 1);
          alert("We bought a new share with id: " + id);
        } catch (e) {
          alert(e.message);
        }
      } else {
        alert(
          "Please wait for the first server response. (Did you fill in your credentials?)"
        );
      }
    },
    handleGameUpdate(game) {
      // For now we want to extract the companyId and player name
      this.name = game.player.name;
      this.companyId = game.companies.find(c => c.key === "ing").id;
    }
  },

  // This method is called once when the component is started
  mounted() {
    // Subscribe to game updates
    this.querySubscription = api.activeGameSubscription().subscribe({
      next: ({ data }) => {
        // Handle the game update
        this.handleGameUpdate(data.activeGame);
      },
      error: e => {
        console.error(e);
      }
    });

    // Also subscribe to news updates
    this.newsSubscription = api.newsSubscription().subscribe({
      next: ({ data }) => {
        // Show the news
        console.log(data);
        this.news = data.news.headline;
      },
      error: e => {
        console.error(e);
      }
    });
  },

  // This method is called once when the component is destroyed
  beforeDestroy() {
    // Always unsubscribe, to prevent hot-reloading bugs
    this.querySubscription.unsubscribe();
    this.newsSubscription.unsubscribe();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  color: #4e4e4e;
}
</style>
