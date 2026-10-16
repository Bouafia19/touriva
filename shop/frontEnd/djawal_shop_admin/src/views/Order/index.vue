<template>
    
        <v-container>
            <v-data-table
                :headers="headers"
                :items="users.getClients"
                :loading="!users.getClients"
                @click:row="getDetails"
                :search="search"
            >
                <template v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort }">
                    <tr style="color: #00366f;">
                    <template v-for="column in columns" :key="column.key">
                        <td>
                        {{ $t(column.text) }}
                        </td>
                    </template>
                    </tr>
                </template>

                <template v-slot:[`item.name`]="{ item }">
                    <div v-if="item.lastName || item.firstName">
                        {{ item.firstName + ' ' + item.lastName }}
                    </div>
                    <div v-else>
                        {{ item.companyName }}
                    </div>
                    
                </template>

                <template v-slot:top>
                    <v-toolbar
                        flat
                    >
                        <v-toolbar-title>{{ $t('Order')}}</v-toolbar-title>

                        <v-divider
                            class="mx-4"
                            inset
                            vertical
                        ></v-divider>

                        <v-text-field
                            v-model="search"
                            append-icon="mdi-magnify"
                            :label="$t('Search')"
                            single-line
                            hide-details
                            class="shrink mx-4"
                            rounded
                            outlined
                            dense
                        ></v-text-field>

                        <v-spacer></v-spacer>
                    </v-toolbar>
                </template>
                <template v-slot:no-data>
                    <v-btn
                        color="primary"
                        @click="initialize"
                    >
                        Reset
                    </v-btn>
                </template>
            </v-data-table>
        </v-container>
   
</template>

<script setup>
    import { ref, onMounted, nextTick, computed, watch } from 'vue'
    import { useUsersStore } from '@/stores/users'
    import { useRouter } from 'vue-router'
   
    const users = useUsersStore()
    const router = useRouter()
    
    let headers = ref([
                {
                    text: 'Email',
                    align: 'start',
                    sortable: false,
                    value: 'email',
                },
                { text: 'Name', value: 'name' },
                { text: 'Phone', value: 'phone' },
                { text: 'roles', value: 'role' }
            ]),
        search = ref('')

    onMounted(()=>{
        initialize()
    })

    const getDetails = (e, {item}) => {
        console.log('item', item)
        router.push({ name: 'OrderDetail', params: { id: item._id, client: `${item.firstName} ${item.lastName}` }})
    }

    const initialize = () => {
        users.fetchUsers()
    }
  
</script>

<style>
    .v-data-table {
        border: 1px solid black;
    }
    :deep(table > thead > tr:last-child > th) {
        color: white !important;
        background-color: #00366f !important;
    }
    :deep(.mdi-arrow-up::before) {
        color: white !important;
    }
</style>