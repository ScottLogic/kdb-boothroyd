const serverEditComponent = {
  props: {
    server: {
      type: Object,
      required: false,
    },
  },
  template:
    /*html*/
    `<div>
      <el-form label-width="120px">
        <el-form-item label="name">
          <el-input v-model="server.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="host">
          <el-input v-model="server.host" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="port">
          <el-input v-model.number="server.port" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCancel">Cancel</el-button>
        <el-button type="primary" @click="dialogConfirm">OK</el-button>
      </span>
    </div>`,

  methods: {
    async dialogCancel() {
      this.$emit("cancel");
    },
    async dialogConfirm() {
      this.$emit("confirm");
    },
  },

  emits: ["confirm", "cancel"],
};
module.exports = serverEditComponent;
