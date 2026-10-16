<template>
    <div>
        <table id="my-table">
            <thead>
                <tr>
                    <th 
                        v-for="item in headers" 
                        :key="item.value"
                    >
                        {{ item.text }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="item in trips" 
                    :key="item._id"
                >
                    <td>{{ item.clientId.lastName + ' ' + item.clientId.firstName }}</td>
                    <td>{{ item.from }}</td>
                    <td>{{ item.to }}</td>
                    <td>{{ formatNumber(item.price) }}</td>
                </tr>
            </tbody>
            <tfoot v-if="billing">
                <tr>
                    <td></td>
                    <td></td>
                    <td>Total Brut</td>
                    <td>{{ formatNumber(billing.brutAmount) }}</td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td>Net</td>
                    <td>{{ formatNumber(billing.amount) }}</td>
                </tr>
            </tfoot>
        </table>
    </div> 
</template>

<script>
    import jsPDF from "jspdf"
    import autoTable from 'jspdf-autotable'
    import "@/assets/dataTableFonts/Amiri-Regular-normal"
    import "@/assets/dataTableFonts/Amiri-Bold-normal"
    import moment from 'moment'

    export default {
        props: ['trips', 'partner', 'company', 'billing'],

        data: () => ({
            tableRows: [],
            headers: [
                { text: 'Client' },
                { text: 'From' },
                { text: 'To' },
                { text: 'Price' }
            ]
        }),

        methods: {
            formatNumber(value) {
                return new Intl.NumberFormat(this.$i18n.locale, { style: 'currency', currency: 'DZD' }).format(value)
            },

            formatDate (value) {
                return value ? moment(value).format('dddd, MMMM Do YYYY') : ''
            },

            generateReport() {
                const doc = new jsPDF('p','mm','a4')    //  210 x 297 mm

                doc.setFontSize(12)
                
                doc.addImage(this.company.logo, 'JPEG', 10, 5, 20, 20)
                doc.text(this.company.companyName, 100, 10)
                doc.text(`Adress: ${this.company.street}, ${this.company.city}, ${this.company.state}`, 100, 15)
                doc.text(`Phone: ${this.company.phone}`, 100, 20)
                doc.text(`Email: ${this.company.email}`, 100, 25)
                doc.text(`Site: ${this.company.siteWeb}`, 100, 30)

                doc.line(5, 35, 200, 35)

                doc.text(`NIS: ${this.company.statisticalIdentifierNumber}`, 120, 40)
                doc.text(`NIF: ${this.company.taxIdentifierNumber}`, 120, 45)
                doc.text(`RC: ${this.company.commercialRegisterNumber}`, 120, 50)
                doc.text(`ART: ${this.company.taxArticleNumber}`, 120, 55)

                doc.text(`Date: ${this.formatDate(this.billing.date)}`, 120, 65)
                
                doc.text(`Client: ${this.partner.firstName} ${this.partner.lastName}`, 10, 40)
                doc.text(`Phone: ${this.partner.phone}`, 10, 45)
                doc.text(`Email: ${this.partner.email}`, 10, 50)

                autoTable(doc, {
                    html: '#my-table',
                    bodyStyles: { font: "Amiri-Regular" },
                    margin: { top: 70, left: 10, right: 10, bottom: 5 },
                    theme: 'grid',
                    didParseCell: function (data) {
                    //    data.row.height = 22
                    },
                    styles: { 
                        halign: 'center', 
                        valign: 'middle', 
                        fontSize: 14, 
                        fontStyle: 'bold',
                        cellPadding: { top: 0, right: 0, bottom: 0, left: 0 }, 
                        lineWidth: 0,
                        // cellWidth: 38
                    }
                })

                const totalPages = doc.internal.getNumberOfPages()
                for (let i = 1; i <= totalPages; i++) {
                    doc.setPage(i)
                    doc.setFontSize(10)
                    doc.text(i + ' / ' + totalPages, (100), (295))
                }  

                doc.save(this.$t('invoice') +'.pdf')
            },
        }
    }
</script>
