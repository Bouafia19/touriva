<template>
    <v-data-table
        :headers="headers"
        :items="data"
        :loading="!data"
        class="mt-4"
        hide-default-footer
    >

        <template v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort }">
            <tr style="color: #00366f;">
                <template v-for="column in columns" :key="column.key">
                    <td>
                        {{ column.text }}
                    </td>
                </template>
            </tr>
        </template>

        <template v-slot:[`item.ownerId`]="{ item }">
            {{ item.ownerId.firstName + ' ' + item.ownerId.lastName }}
        </template>

        <template v-slot:[`item.price`]="{ item }">
            {{ formatNumber(item.price) }}
        </template>

        <template v-slot:[`item.published`]="{ item }">
            <v-chip
                :color="item.published ? 'success' : 'error'"
                text-color="white"
                small
                class="ma-1"
                variant="flat"
            >
                {{ item.published ? 'Yes' : 'No' }}
            </v-chip>
        </template>

        <template v-slot:[`item.paid`]="{ item }">
            <v-chip
                :color="item.paid ? 'success' : 'error'"
                text-color="white"
                small
                class="ma-1"
                variant="flat"
            >
                {{ item.paid ? 'Yes' : 'No' }}
            </v-chip>
        </template>

        <template v-slot:top>
            <v-toolbar
                flat
            >
                <v-toolbar-title>{{ $t('Announcements')}}</v-toolbar-title>

                <v-divider
                    class="mx-4"
                    inset
                    vertical
                ></v-divider>

                <v-spacer></v-spacer>
            </v-toolbar>
        </template>
        <template v-slot:no-data>
            <v-btn
                color="primary"
                text
            >
                {{ $t('noRecords')}}
            </v-btn>
        </template>
    </v-data-table>
</template>

<script>
    export default {
        props: ['data', 'headers'],

        methods: {
            formatNumber(value) {
                return new Intl.NumberFormat(this.$i18n.locale, { style: 'currency', currency: 'DZD' }).format(value)
            }
        }
    }
</script>

<style scoped>
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
    .v-card__title {
        background-color: #00366f;
        color: white;
    }
    .v-card__actions {
        background-color: #00366f;
    }
</style>