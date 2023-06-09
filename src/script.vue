<template>
  <main id="app" class="container">
    <hgroup>
      <h2>
        Create your
        <code>mailto</code>
        link quickly!
      </h2>
      <h3>Text formatting utility.</h3>
    </hgroup>

    <article>
      <header class="outputBox">
        <code
          data-tooltip="Click to copy to clipboard"
          @click.stop.prevent="copyToClipboard"
        >
          {{ outputUrl }}
        </code>
      </header>

      <form>
        <label for="target-email-id">
          Target Email ID
          <input
            name="target-email-id"
            placeholder="Target Email ID"
            type="email"
            multiple="true"
            :aria-invalid="errors.emailId"
            v-model="emailId"
            v-on:keyup="updateOutputUrl"
          />
        </label>
        <div class="grid">
          <label for="cc">
            <span data-tooltip="Carbon Copy" data-placement="right">CC</span>
            <input
              name="cc"
              placeholder="CC"
              type="email"
              multiple="true"
              :aria-invalid="errors.cc"
              v-model="email.cc"
              v-on:keyup="updateOutputUrl"
            />
          </label>
          <label for="bcc">
            <span data-tooltip="Blind Carbon Copy" data-placement="right">
              BCC
            </span>
            <input
              name="bcc"
              placeholder="BCC"
              type="email"
              multiple="true"
              :aria-invalid="errors.bcc"
              v-model="email.bcc"
              v-on:keyup="updateOutputUrl"
            />
          </label>
        </div>
        <label for="subject">
          Subject
          <input
            name="subject"
            placeholder="Subject"
            type="text"
            v-model="email.subject"
            v-on:keyup="updateOutputUrl"
          />
        </label>
        <label for="body">
          Body
          <textarea
            name="body"
            placeholder="Body"
            type="text"
            required
            v-model="email.body"
            v-on:keyup="updateOutputUrl"
          ></textarea>
        </label>
        <input type="hidden" id="final-link-to-copy" :value="outputUrl" />
        <div class="grid gridWithSpace">
          <a role="button" href="#" @click.stop.prevent="copyToClipboard">
            Copy to Clipboard
          </a>

          <a
            role="button"
            class="outline"
            :href="outputUrl"
            target="_blank"
            data-tooltip="Opens in a new tab"
          >
            Test it!
          </a>
        </div>
      </form>

      <footer>
        Built by
        <a href="https://github.com/ajitzero" target="_blank">@ajitzero</a>
      </footer>
    </article>
  </main>
</template>

<script>
export default {
  created() {
    this.updateOutputUrl();
  },
  data() {
    return {
      errors: {
        emailId: false
        // cc: false,
        // bcc: false
      },
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
      this.outputUrl = this.getOutputUrl();
    },
    getOutputUrl() {
      const remaining = Object.keys(this.email).filter(
        (key) => this.email[key].trim().length > 0
      );
      const errors = [];
      this.errors.emailId = this.validateEmailField(this.emailId, {
        required: true
      });
      this.errors.cc = this.validateEmailField(this.email.cc);
      this.errors.bcc = this.validateEmailField(this.email.bcc);
      if (this.errors.emailId) errors.push("Target Email ID");
      if (this.errors.cc) errors.push("CC");
      if (this.errors.bcc) errors.push("BCC");
      if (errors.length) {
        return "Required valid fields: " + errors.join(", ") + ".";
      }
      const customFields = remaining
        .map((key) => `${key}=${encodeURI(this.email[key].trim())}`)
        .join("&");
      return (
        `mailto:${this.emailId}` +
        (customFields.length ? `?${customFields}` : "")
      );
    },
    validateEmailField(value, options) {
      options = {
        required: false,
        ...options
      };
      const emails = value
        .split(",")
        .map((val) => val.trim())
        .filter(Boolean)
        .map((val) => this.isValidEmail(val.trim()));
      if (options.required) {
        return emails.length === 0 || emails.some((flag) => !flag);
      }
      return emails.length != 0 ? emails.some((flag) => !flag) : false;
    },
    isValidEmail(email) {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    },
    copyToClipboard() {
      const finalLinkToCopy = document.querySelector("#final-link-to-copy");
      finalLinkToCopy.setAttribute("type", "text");
      finalLinkToCopy.select();
      try {
        const passed = document.execCommand("copy");
        alert(
          passed
            ? "Copied to clipboard!"
            : "Unable to copy! Please select the text & copy it."
        );
      } catch (e) {
        alert("Unable to copy! Please select the text & copy it.");
      }
      finalLinkToCopy.setAttribute("type", "hidden");
      window.getSelection().removeAllRanges();
    }
  }
};
</script>

<style>
#app {
  /* lime */
  --primary: #c0ca33;
  --primary-hover: #afb42b;
  --primary-focus: rgba(192, 202, 51, 0.125);
  --primary-inverse: rgba(0, 0, 0, 0.75);

  font-family: system-ui, sans-serif;
}
.outputBox {
  -ms-user-select: all;
  -webkit-user-select: all;
  user-select: all;
  word-break: break-all;
}
hgroup {
  text-align: center;
}
textarea {
  min-height: 200px;
  resize: vertical;
}
footer {
  text-align: center;
}
.gridWithSpace > * {
  margin-bottom: 1rem;
}
button,
[role="button"] {
  user-select: none;
}
</style>
