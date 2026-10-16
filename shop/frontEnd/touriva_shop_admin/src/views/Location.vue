<template>
    <v-container>
        <h1>Location</h1>
        <v-row class="justify-center">
            <v-col
                cols="4"

            >
                <v-file-input 
                    v-model="csvfile" 
                    type="file" 
                    :label="$t('File')"
                    outlined
                    prepend-icon="mdi-file"
                    dense
                    @change="handleFileUpload"  
                />   
            </v-col>  

            <wilaya />

        </v-row>
    </v-container>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useWilayasStore } from '@/stores/wilaya'
    import { useDairasStore } from '@/stores/daira'
    import { useCommunesStore } from '@/stores/commune'
    import Papa from 'papaparse'
    import wilaya from '@/components/wilaya.vue'

    const wilayas = useWilayasStore()
    const daira = useDairasStore()
    const commune = useCommunesStore()

    let csvfile = ref(null),
        arrayOfWilaya = ref([])

    const handleFileUpload = (event) => {
        wilayas.deleteMultWilayas()
        const file = event.target.files[0]; // Get the uploaded file
        if (csvfile.value) {
            Papa.parse(csvfile.value, {
            header: true, // Use the first row as headers
            complete: (results) => {
                // console.log('data', results.data)
                const jsonData = results.data;
                // document.getElementById('output').textContent = JSON.stringify(jsonData, null, 4);
                // const uniqueNames = findUniqueValuesWithReduce(results.data, 'Wilaya');
                // uniqueNames.forEach(element => {
                //     arrayOfWilaya.value.push({ name: element})
                    
                // });
                // console.log('arrayOfWilaya.value', arrayOfWilaya.value)
                wilayas.addMultWilayas({ data: jsonData })
            },
            error: (error) => {
                console.error('Error:', error);
            }
            });
        }
    }

    const findUniqueValuesWithReduce = (array, key) => {
        return array.reduce((accumulator, item) => {
            if (item[key] !== undefined && item[key] !== '' && !accumulator.includes(item[key])) {
                accumulator.push(item[key]);
            }
            return accumulator;
        }, []);
    }

    onMounted(() => {
        wilayas.fetchWilayas()
        daira.fetchDairas()
        commune.fetchCommunes()
    })
</script>