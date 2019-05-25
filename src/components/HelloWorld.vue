<template>
  <div>
    <div class="">
      <div class="box column">
        <h2>Capital:</h2>
        <p>{{capital}}</p>
      </div>
      <div class="box column">
        <h2>Latest news:</h2>
        <p>{{news}}</p>
      </div>
    </div>
    <div class="columns is-multiline">
      <div v-for="(value,key) in data" class="box column is-one-quarter">
        {{key}}
        <stockChart :chart-data="value"></stockChart>

        <h2>{{value.amount}}</h2>

        <input :ref="key + 'buy'">
        <button @click="buy(value.id,$refs[key+'buy'][0].value)">Buy share</button>
        <br>

        <input :ref="key + 'sell'">
        <button @click="short(value.id,$refs[key+'sell'][0].value)">Sell/Short share</button>
      </div>
    </div>
  </div>
</template>

<script>
import * as api from "../api";
import StockChart from "./StockChart.vue"

export default {
  name: "HelloWorld",
  components: {
    StockChart
  },
  data: () => ({
    name: "[waiting for server]",
    companyId: null,
    time: 0,
    news: "No latest news yet!",
    data:{
    },
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
      console.log(game)
      if(!game.companies){
        return;
      }
      var shares = game.player.shares;
      var b = 0;
      for(var i in game.companies){
        if(b>1000){
          break;
        }
        b++;
        var company = game.companies[i]
        var key = company.key
        var id = company.id
        if(!this.data[key]){
          this.data[key]={"id":id,'amount':0,"datasets":[{'data':[]}],"labels":[]};
        } else {
          this.data[key]['labels'].push(parseInt(this.time));
          this.data[key]['datasets'][0]['data'].push(parseInt(company.value));
          console.log(shares)
          var share = shares.find(c => c.company.id === id);
          if(share){
            this.data[key]['amount']=share.amount;
          }
        }
      }
      this.time+=1;
      this.capital = game.player.capital;
      // For now we want to extract the companyId and player name
      // this.name = game.player.name;
      // this.companyId = game.companies.find(c => c.key === "ing").id;
    },

    async buy(stock,value) {
      console.log(value);
        try {
          const id = await api.placeImmediateBuyOrder(stock, value);
          alert("We bought a new share with id: " + stock);
        } catch (e) {
          alert(e.message);
        }
    },

    async short(stock,value) {
        try {
          const id = await api.placeImmediateSellOrder(stock, value);
          alert("We short a new share with id: " + stock);
        } catch (e) {
          alert(e.message);
        }
    },
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
