<template>
  <div id="app">
    <h1>Create your <code>mailto</code> link quickly!</h1>

    <code class="outputBox">
      {{ outputUrl }}
    </code>

    <form>
      <input
        placeholder="Target Email ID"
        type="email"
        v-model="emailId"
        v-on:keyup="updateOutputUrl"
      />
      <input
        placeholder="Subject"
        type="text"
        v-model="email.subject"
        v-on:keyup="updateOutputUrl"
      />
      <input
        placeholder="CC"
        type="text"
        v-model="email.cc"
        v-on:keyup="updateOutputUrl"
      />
      <input
        placeholder="BCC"
        type="text"
        v-model="email.bcc"
        v-on:keyup="updateOutputUrl"
      />
      <textarea
        placeholder="Body"
        type="text"
        v-model="email.body"
        v-on:keyup="updateOutputUrl"
      ></textarea>
    </form>

    <a class="btn" v-bind:href="outputUrl" target="_blank">
      Test it!
    </a>

    <footer>
      Built by <a href="https://twitter.com/ajitzero">@AjitZero</a>
    </footer>
  </div>
</template>

<script>
export default {
  created() {
    this.updateOutputUrl();
  },
  data() {
    return {
      outputUrl: "Type something",
      emailId: "you@example.com",
      email: {
        subject: "Hey there",
        cc: "somebody@example.com",
        bcc: "somebody.else@example.com",
        body: "Hey there, how have you been?"
      }
    };
  },
  methods: {
    updateOutputUrl() {
      this.outputUrl = "mailto:" + this.emailId;

      const emailKeys = Object.keys(this.email);

      const remaining = emailKeys.filter(
        (key) => this.email[key].trim().length > 0
      );
      if (remaining.length > 0) {
        this.outputUrl += "?";
      }

      this.outputUrl += remaining
        .map((key) => `${key}=${encodeURI(this.email[key].trim())}`)
        .join("&");
    }
  }
};
</script>

<style>
#app {
  color: #2c3e50;
  font-family: Helvetica Neue, Georgia, sans-serif;
  margin: 60px auto;
  max-width: 600px;
  width: 90%;
}

.outputBox {
  -ms-user-select: all;
  -webkit-user-select: all;
  user-select: all;
  background: #2d2b55;
  border-radius: 6px;
  box-sizing: border-box;
  color: #fad000;
  display: block;
  margin: 0 auto 20px;
  overflow-x: auto;
  padding: 20px;
  white-space: nowrap;
  width: 100%;
}

a {
  color: #000;
  font-weight: 700;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

.btn {
  background: #2d2b55;
  border-radius: 6px;
  box-sizing: border-box;
  color: #fad000;
  display: inline-block;
  float: right;
  letter-spacing: 1px;
  margin: 20px auto;
  padding: 20px;
  text-transform: uppercase;
}

.btn:hover {
  opacity: 0.9;
  text-decoration: none;
}

input,
textarea {
  border-radius: 6px;
  border: 1px solid #a9a9a9;
  box-sizing: border-box;
  display: block;
  margin: 20px 0 0;
  padding: 10px;
  width: 100%;
}

textarea {
  min-height: 200px;
  resize: vertical;
}

footer {
  clear: both;
  margin: 20px 0;
  text-align: center;
}
</style>
