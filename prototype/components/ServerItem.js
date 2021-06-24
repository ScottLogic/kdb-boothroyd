const serverEditComponent = {
    props: {
        server: {
            type: Object,
            required: false
        },
    },

    template:
    /*html*/
    `<div>
        <input v-model="serverEdit.name" placeholder="Name"/>
        <input v-model="serverEdit.host" placeholder="Host"/>
        <input v-model="serverEdit.port" placeholder="Port"/>
        <input v-model="serverEdit.username" placeholder="Username"/>
        <input type="password" v-model="serverEdit.password" placeholder="Password"/>
        <button class="btn" @click="cancel">Cancel</button>
        <button class="btn" @click="save">Save</button>
    </div>`,

    data() {
        return {
            serverEdit: {...this.server},
        };
    },

    methods: {
        async cancel() {
            console.log('cancel edit');
            this.$emit('done', null)
        },
        async save() {
            console.log('save changes');
            console.log(this.serverEdit.host);
            //TODO: Persist the changes here - or possibly in the event handler?
            this.$emit('done', this.serverEdit);
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
    `<ul v-bind:style="{padding: '0.2em'}">
        <li v-bind:style="{padding: '0.1em', display: 'inlineBlock', float: 'left', width:'8em'}">{{ server.name }}</li>
        <li v-bind:style="{padding: '0.1em', display: 'inlineBlock', float: 'left', width:'15em'}">{{ server.host + ':' + server.port }}</li>
        <button v-bind:class="{btn: true}" @click="editServer(server)">Edit</button>
        <button v-bind:class="{btn: true}" @click="deleteServer(server)">Delete</button>
        <server-edit v-if="toggleEdit" :server="server" @done="handleDone"></server-edit>
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
            this.$emit('delete', s);
        },
        async handleDone(cs) {
            this.toggleEdit = false;
            if (cs !== null) {
                this.$emit('save', cs)
            }
        }
    },
    
    emits: ['save', 'delete']
};

module.exports = { serverItemComponent, serverEditComponent };