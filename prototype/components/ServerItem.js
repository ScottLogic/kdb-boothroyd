const { boolean } = require("node-q");

const serverEditComponent = {
    props: {
        server: {
            type: Object,
            required: true
        },
    },

    template:
    /*html*/
    `<div>
        <input v-model="serverEdit.name" placeholder="Name"/>
        <input v-model="serverEdit.connStr" placeholder="Host:Port"/>
        <button class="btn" @click="cancel()">Cancel</button>
        <button class="btn" @click="save()">Save</button>
    </div>`,

    data() {
        return {
            serverEdit: {...this.server},
        };
    },

    methods: {
        async cancel() {
            console.log('cancel edit');
            this.$emit('done')
        },
        async save() {
            console.log('save changes');
            // Persist the changes here
            this.$emit('done')
        },
    },

    emits: ['done']
};

const serverItemComponent = {
    props: {
        server: {
            type: Object,
            required: true
        }
    },
    components: {
        'server-edit': serverEditComponent
    },
    
    template:
    /*html*/
    `<ul v-bind:style="{display: inline, listStyle: none, padding: '0.2em'}">
        <li v-bind:style="{padding: '0.1em', display: 'inlineBlock', float: 'left', width:'8em'}">{{ server.name }}</li>
        <li v-bind:style="{padding: '0.1em', display: 'inlineBlock', float: 'left', width:'15em'}">{{ server.connStr }}</li>
        <button v-bind:class="{btn: true}" @click="editServer(server)">Edit</button>
        <button v-bind:class="{btn: true}" @click="deleteServer(server)">Delete</button>
        <server-edit v-if="toggleEdit" :server="server" @done="toggleEdit = false"></server-edit>
    </ul>`,

    data() {
        return {
            toggleEdit: false,
        }
    },

    methods: {
        async editServer(s) {
            console.log("Editing " + s.name);
            this.toggleEdit = true;
        },
        async deleteServer(s) {
            console.log("Deleting "+ s.name);
        },
    }
};

module.exports = serverItemComponent;