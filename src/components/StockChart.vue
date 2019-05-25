<script>
import { Line, mixins } from 'vue-chartjs'
import { setTimeout } from 'timers';

export default {
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: ['chartData', 'options'],
  mounted () {
    this.renderChart(this.chartData,{responsive: true, maintainAspectRatio: false})

    var that = this;

    this.$nextTick(function () {
      window.setInterval(() => {
        that.$data._chart.destroy();
        that.renderChart(that.chartData,{responsive: true, maintainAspectRatio: false})
                },1000);
    });

    
  },
  // watch: { 
  //       'chartData': {
  //           handler: function(val, oldVal) {
  //           },
  //           deep: true,
  //       },
  // }
}
</script>
