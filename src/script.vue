<template>
  <div id="app">
    <h1>
      Create your
      <code>mailto</code>
      link quickly!
    </h1>

    <code class="outputBox">
      {{ outputUrl }}
    </code>

    <form>
      <label for="target-email-id">Target Email ID</label>
      <input
        name="target-email-id"
        placeholder="Target Email ID"
        type="email"
        v-model="emailId"
        v-on:keyup="updateOutputUrl"
      />
      <label for="subject">Subject</label>
      <input
        name="subject"
        placeholder="Subject"
        type="text"
        v-model="email.subject"
        v-on:keyup="updateOutputUrl"
      />
      <label for="cc">CC</label>
      <input
        name="cc"
        placeholder="CC"
        type="text"
        v-model="email.cc"
        v-on:keyup="updateOutputUrl"
      />
      <label for="bcc">BCC</label>
      <input
        name="bcc"
        placeholder="BCC"
        type="text"
        v-model="email.bcc"
        v-on:keyup="updateOutputUrl"
      />
      <label for="body">Body</label>
      <textarea
        name="body"
        placeholder="Body"
        type="text"
        v-model="email.body"
        v-on:keyup="updateOutputUrl"
      ></textarea>
      <input type="hidden" id="final-link-to-copy" :value="outputUrl" />
    </form>

    <a class="btn" @click.stop.prevent="copyToClipboard">
      Copy to Clipboard
    </a>

    <a class="btn" v-bind:href="outputUrl">
      Test it!
    </a>

    <footer>
      Built by
      <a href="https://twitter.com/ajitzero">@AjitZero</a>
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
    },
    copyToClipboard() {
      const finalLinkToCopy = document.querySelector("#final-link-to-copy");
      finalLinkToCopy.setAttribute("type", "text");
      finalLinkToCopy.select();
      try {
        let res = document.execCommand("copy");
        alert("Copied to clipboard!");
      } catch (e) {
        alert("Unable to copy! Please select the text & copy it.");
      }
      finalLinkToCopy.setAttribute("type", "hidden");
      window.getSelection().removeAllRanges();
    },
  }
};
</script>

<style>
#app {
  color: #2c3e50;
  font-family: Helvetica Neue, Georgia, sans-serif;
  font-size: 16px;
  margin: 60px auto 40px;
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

h1 {
  text-align: center;
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
  cursor: pointer;
  display: inline-block;
  float: right;
  letter-spacing: 1px;
  margin: 10px 0;
  padding: 10px 20px;
  text-align: center;
  text-transform: uppercase;
  width: 100%;
}

@media (min-width: 720px) {
  .btn {
    margin: 10px 0 10px 10px;
    width: auto;
  }
}

.btn:hover {
  opacity: 0.9;
  text-decoration: none;
}

label {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}
label::after {
  content: ":";
}

input,
textarea {
  border-radius: 6px;
  border: 1px solid #a9a9a9;
  box-sizing: border-box;
  display: block;
  margin: 0 0 10px;
  padding: 10px;
  width: 100%;
}

textarea {
  min-height: 200px;
  resize: vertical;
}

footer {
  clear: both;
  padding: 1rem 0;
  text-align: center;
}
</style>
