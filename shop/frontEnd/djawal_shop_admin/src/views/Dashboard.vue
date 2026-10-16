<template>
  <h1>Dashboard</h1>
</template>
<!-- <template>
  <base-layout>
  <v-container fluid>
    <div class="text-center" v-if="loadingPage">
      <v-row 
        class="d-flex justify-center align-center"  
        style="height: 80vh;"
      >
        <v-progress-circular
          indeterminate
          color="next"
        ></v-progress-circular>
      </v-row>
    </div>
    <div v-else>
      <v-row class="justify-center">
        <v-col
          v-for="item in items"
          :key="item.title"
          cols="auto"
        >
          <v-card
            class="mx-auto"
            width="260"
            outlined
            :to="item.to"
          >
            <v-list-item three-line>
              <v-list-item-icon :style="{ 'background-color': item.color}" style="border-radius: 50%;" >
                <v-icon color="white" large>{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <div class="text-overline mb-1" :style="{ 'color': item.color}">
                  {{ $t(item.title) }}
                </div>
                <v-list-item-title class="text-h5 mb-1" >
                  {{ item.count }}
                </v-list-item-title>
                <v-list-item-subtitle >{{ formatNumber(item.totalAmount) }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>

      <v-row align="center" justify="center" >
        <v-btn-toggle
          rounded
          color="teal darken-3"
          dense
        
        >
          <v-btn @click="updateData('one_month')">
            {{ $t('oneMonth') }}
          </v-btn>

          <v-btn @click="updateData('six_months')">
            {{ $t('sixMonths') }}
          </v-btn>

          <v-btn @click="updateData('one_year')">
            {{ $t('oneYear') }}
          </v-btn>

          <v-btn @click="updateData('all')">
            {{ $t('ALL') }}
          </v-btn>
        </v-btn-toggle>
      </v-row>

      <v-row >
          <v-col 
            cols="12"
          >
                  <template id="vuechart-trips">
                      <div>
                          <apexchart type="area" height="350" :options="tripsOptions" :series="tripsSeries"></apexchart>
                      </div>
                  </template>
          </v-col>
          <v-col
            cols="4"
          >
            <template>
              <div>
                <apexchart width="380" type="donut" :options="tripsStatusOptions" :series="tripsStatusSeries"></apexchart>
              </div>
            </template>
          </v-col>
          <v-col 
            cols="4"
            
          >
                  <template>
                      <div>
                        <apexchart width="380" type="donut" :options="usersRoleOptions" :series="usersRoleSeries"></apexchart>
                      </div>
                  </template>
          </v-col>
          <v-col 
            cols="4"
            
          >
                  <template>
                      <div>
                        <apexchart width="380" type="donut" :options="cancellationByOptions" :series="cancellationBySeries"></apexchart>
                      </div>
                  </template>
          </v-col>
      </v-row>
    </div>
  </v-container>
  </base-layout>
</template>

<script>
  import BaseLayout from '@/components/BaseLayout.vue'
  import moment from 'moment'
  import axios from 'axios'

export default {
  components: {
    'base-layout': BaseLayout
  },
   
  data: () => ({
    loadingPage: true,
    items: [
          { title: 'TripsInProgress', icon: 'mdi-routes-clock', to: '/products', color: '#008080', count: 0, totalAmount: 0 },
          { title: 'TripsCanceled', icon: 'mdi-routes', to: '/trips', color: '#4682B4', count: 0, totalAmount: 0 },
          { title: 'TripsFinished', icon: 'mdi-routes', to: '/purchases', color: '#A52A2A', count: 0, totalAmount: 0 },
          { title: 'Clients', icon: 'mdi-account-group-outline', to: '/customers', color: '#9ACD32', count: 0, totalAmount: 0 },
          { title: 'Transporters', icon: 'mdi-account-group', to: '/vendors', color: '#DDA0DD', count: 0, totalAmount: 0 },
          { title: 'Administrators', icon: 'mdi-account-group', to: '/invoices', color: '#008B8B', count: 0, totalAmount: 0 },
        ],
        tripsOptions: {
          chart: {
            id: 'vuechart-trips',
            toolbar: {
              show: false,
            }
          },
          xaxis: {
            categories: []
          },
          title: {
            text: 'état des voyages terminés',
            align: 'center',
            style: {
              fontSize:  '16px',
            },
          },
          colors: ['#00897b']
        },
        tripsSeries: [{
          name: 'Total',
          data: []
        }],
        tripsStatusOptions: {
            chart: {
              width: 420,
              id: 'vuechart-tripsStates',
              dropShadow: {
                enabled: true,
                color: '#111',
                top: -1,
                left: 3,
                blur: 3,
                opacity: 0.2
              }
            },
            stroke: {
              width: 0,
            },
            plotOptions: {
              pie: {
                donut: {
                  labels: {
                    show: true,
                    total: {
                      showAlways: true,
                      show: true
                    }
                  }
                }
              }
            },
            labels: [],
            dataLabels: {
              dropShadow: {
                blur: 3,
                opacity: 0.8
              }
            },
            states: {
              hover: {
                filter: 'none'
              }
            },
            theme: {
              palette: 'palette2'
            },
            title: {
              text: "Trips Status"
            },
            responsive: [{
              breakpoint: 480,
              options: {
                chart: {
                  width: 200
                },
                legend: {
                  position: 'bottom'
                }
              }
            }]
        },
        tripsStatusSeries: [],
        usersRoleOptions: {
            chart: {
              width: 420,
              id: 'vuechart-usersStates',
              dropShadow: {
                enabled: true,
                color: '#111',
                top: -1,
                left: 3,
                blur: 3,
                opacity: 0.2
              }
            },
            stroke: {
              width: 0,
            },
            plotOptions: {
              pie: {
                donut: {
                  labels: {
                    show: true,
                    total: {
                      showAlways: true,
                      show: true
                    }
                  }
                }
              }
            },
            labels: [],
            dataLabels: {
              dropShadow: {
                blur: 3,
                opacity: 0.8
              }
            },
            states: {
              hover: {
                filter: 'none'
              }
            },
            theme: {
              palette: 'palette3'
            },
            title: {
              text: "Users Role"
            },
            responsive: [{
              breakpoint: 480,
              options: {
                chart: {
                  width: 200
                },
                legend: {
                  position: 'bottom'
                }
              }
            }]
        },
        usersRoleSeries: [],
        cancellationByOptions: {
          chart: {
              width: 420,
              id: 'vuechart-cancellationBy',
              dropShadow: {
                enabled: true,
                color: '#111',
                top: -1,
                left: 3,
                blur: 3,
                opacity: 0.2
              }
            },
            stroke: {
              width: 0,
            },
            plotOptions: {
              pie: {
                donut: {
                  labels: {
                    show: true,
                    total: {
                      showAlways: true,
                      show: true
                    }
                  }
                }
              }
            },
            labels: [],
            dataLabels: {
              dropShadow: {
                blur: 3,
                opacity: 0.8
              }
            },
            fill: {
            type: 'pattern',
              opacity: 1,
              pattern: {
                enabled: true,
                style: ['verticalLines', 'squares', 'horizontalLines', 'circles','slantedLines'],
              },
            },
            states: {
              hover: {
                filter: 'none'
              }
            },
            theme: {
              palette: 'palette2'
            },
            title: {
              text: "Cancellation By"
            },
            responsive: [{
              breakpoint: 480,
              options: {
                chart: {
                  width: 200
                },
                legend: {
                  position: 'bottom'
                }
              }
            }]
        },
        cancellationBySeries: [],
    }),
    methods: {
        init() {
            this.loadTrips()
            this.loadUsers()
        },
        async loadTrips(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/trips', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
           
                let tripsItems = response.data
                this.trips = tripsItems.filter(i => i.status === 'finished')

                this.items[2].count = tripsItems.length
                this.items[2].totalAmount = tripsItems.filter(i => i.status === 'finished').reduce(function(prev, cur) {
                  return prev + cur.price;
                }, 0);

                this.items[0].count = tripsItems.filter(i => i.status === 'started').length
              
                this.items[1].count = tripsItems.filter(i => i.status === 'canceled').length
                
                let categories = []
                let data = []
                let states = []
                let cancellationBy = []
                this.trips.forEach(i => categories.push(this.formatDate(i.start)))
                this.trips.forEach(i => data.push(i.price))
                tripsItems.forEach(i => states.push(i.status))
                let by = tripsItems.filter(i => i.cancellation.by)
                by.forEach(i => cancellationBy.push(i.cancellation.by))

                this.tripsOptions.xaxis.categories = categories
                this.tripsSeries[0].data = data

                this.updateSalechart(categories, data)

                var counts = {};
                states.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });    

                let keys = Object.keys(counts)
                let values = Object.values(counts)

                this.updateSaleStateschart( keys, values)

                var counts = {};
              
                cancellationBy.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });    
                
                let cancellationBykeys = Object.keys(counts)
                let cancellationByvalues = Object.values(counts)

                this.updateCancellationByChart( cancellationBykeys, cancellationByvalues)

          
        },
        async loadUsers(){
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/users', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
              let tripsItems = response.data
                let clients = tripsItems.filter(i => i.role === 'client')
                this.items[3].count = clients.length

                let transporters = tripsItems.filter(i => i.role === 'transporter')
                this.items[4].count = transporters.length

                let admins = tripsItems.filter(i => i.role === 'administrator')
                this.items[5].count = admins.length


                let categories = []
                let data = []
                let states = []
            
                tripsItems.forEach(i => states.push(i.role))
                var counts = {};
                states.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });    

                let keys = Object.keys(counts)
                let values = Object.values(counts)

                this.updateUsersRolschart( keys, values)
                
        },
        
        updateSalechart(categories, data){
            this.tripsOptions = {
                ...this.tripsOptions,
                xaxis: {
                    ...this.tripsOptions.xaxis,
                    categories: categories
                },
                // title: {
                //   ...this.purchaseOptions.title,
                //   text: this.$t('TripsChart')
                // } 
            }
            this.tripsSeries =  [{
                ...this.tripsSeries,
                name: this.$t('Total'),
                data: data
            }]
        },
        updateSaleStateschart( keys, values){
            this.tripsStatusOptions = {
                ...this.tripsStatusOptions,
                labels: keys
            }
            this.tripsStatusSeries.push(...values)
        },
        //
        updateUsersRolschart( keys, values){
            this.usersRoleOptions = {
                ...this.usersRoleOptions,
                labels: keys
            }
            this.usersRoleSeries.push(...values)
        },
        //
        updateCancellationByChart( keys, values){
            this.cancellationByOptions = {
                ...this.cancellationByOptions,
                labels: keys
            }
            this.cancellationBySeries.push(...values)

            this.loadingPage = false
        },
        //
        formatDate(value) {
            return moment(value).locale(this.$i18n.locale).format("DD MMMM YYYY")
        },
        filterTrips(firstDay, lastDay){
          let tripsItems = this.trips.filter(i => new Date(i.start) > firstDay && new Date(i.start) < lastDay )
          
          let categories = []
          let data = []
          
          tripsItems.forEach(i => categories.push(this.formatDate(i.start)))
          tripsItems.forEach(i => data.push(i.price))

          this.updateSalechart(categories, data)
        },
        // filterUsers(firstDay, lastDay){
        //   let purchasesItems = this.purchases.filter(i => new Date(i.date) > firstDay && new Date(i.date) < lastDay )
          
        //   let categories = []
        //   let data = []
          
        //   purchasesItems.forEach(i => categories.push(this.formatDate(i.date)))
        //   purchasesItems.forEach(i => data.push(i.totalPrice))

        //   this.updatePurhaseCharte(categories, data)
        // },
        updateData(timeline) {
            this.selection = timeline
            var date = new Date();
            let lastDay = new Date();
            switch (timeline) {
              case 'one_month':
                let firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1)
                this.filterTrips(firstDay, lastDay)
                // this.filterUsers(firstDay, lastDay)
                
                
                break
              case 'six_months':
                let firstDaySix = new Date(date.getFullYear(), date.getMonth() - 6, 1)
                this.filterTrips(firstDaySix, lastDay)
                // this.filterUsers(firstDaySix, lastDay)
                
                break
              case 'one_year':
                let firstDayYear = new Date(date.getFullYear(), date.getMonth() - 12, 1)
                this.filterTrips(firstDayYear, lastDay)
                // this.filterUsers(firstDayYear, lastDay)
                break
              
              case 'all':
                this.filterTrips(null, lastDay)
                // this.filterUsers(null, lastDay)
                break
              default:
            }
          },
          formatNumber(value) {
            return new Intl.NumberFormat(this.$i18n.locale, { style: 'currency', currency: 'DZD' }).format(value)
          },
    },
    created(){
        this.init()
    }
}

</script>

<style scoped>
.col {
    padding: 5px;
  }
</style> -->