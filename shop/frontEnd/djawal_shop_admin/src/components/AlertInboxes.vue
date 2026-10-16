<template>

    <v-list two-line>
      <v-list-item-group
        active-class="pink--text"
        multiple
      >
        <template v-for="(item, index) in inboxes" :key="index">
          <v-list-item >
            <template v-slot:default="{ active }">
              <v-list-item-content>
                <v-list-item-title>{{ item.name }}</v-list-item-title>

                <v-list-item-subtitle
                  class="text--primary"
                  
                >
                    {{ item.email }}
                </v-list-item-subtitle>

                <v-list-item-subtitle>{{ item.description }}</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-list-item-action-text>{{ item.phone }}</v-list-item-action-text>

                <v-icon
                  v-if="!active"
                  color="grey lighten-1"
                >
                  mdi-star-outline
                </v-icon>

                <v-icon
                  v-else
                  color="yellow darken-3"
                >
                  mdi-star
                </v-icon>
              </v-list-item-action>
            </template>
          </v-list-item>

          <v-divider
            v-if="index < inboxes.length - 1"
            :key="index"
          ></v-divider>
        </template>
      </v-list-item-group>
    </v-list>
</template>

<script>
  export default {
    props: ['inboxes'],
    data: () => ({
      
      
    }),
  }
</script>