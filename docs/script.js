var script = {
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

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("main", { staticClass: "container", attrs: { id: "app" } }, [
    _vm._m(0),
    _vm._v(" "),
    _c("article", [
      _c("header", { staticClass: "outputBox" }, [
        _c(
          "code",
          {
            attrs: { "data-tooltip": "Click to copy to clipboard" },
            on: {
              click: function($event) {
                $event.stopPropagation();
                $event.preventDefault();
                return _vm.copyToClipboard($event)
              }
            }
          },
          [_vm._v("\n        " + _vm._s(_vm.outputUrl) + "\n      ")]
        )
      ]),
      _vm._v(" "),
      _c("form", [
        _c("label", { attrs: { for: "target-email-id" } }, [
          _vm._v("\n        Target Email ID\n        "),
          _c("input", {
            directives: [
              {
                name: "model",
                rawName: "v-model",
                value: _vm.emailId,
                expression: "emailId"
              }
            ],
            attrs: {
              name: "target-email-id",
              placeholder: "Target Email ID",
              type: "email",
              multiple: "true",
              "aria-invalid": _vm.errors.emailId
            },
            domProps: { value: _vm.emailId },
            on: {
              keyup: _vm.updateOutputUrl,
              input: function($event) {
                if ($event.target.composing) {
                  return
                }
                _vm.emailId = $event.target.value;
              }
            }
          })
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "grid" }, [
          _c("label", { attrs: { for: "cc" } }, [
            _c(
              "span",
              {
                attrs: {
                  "data-tooltip": "Carbon Copy",
                  "data-placement": "right"
                }
              },
              [_vm._v("CC")]
            ),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.email.cc,
                  expression: "email.cc"
                }
              ],
              attrs: {
                name: "cc",
                placeholder: "CC",
                type: "email",
                multiple: "true",
                "aria-invalid": _vm.errors.cc
              },
              domProps: { value: _vm.email.cc },
              on: {
                keyup: _vm.updateOutputUrl,
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(_vm.email, "cc", $event.target.value);
                }
              }
            })
          ]),
          _vm._v(" "),
          _c("label", { attrs: { for: "bcc" } }, [
            _c(
              "span",
              {
                attrs: {
                  "data-tooltip": "Blind Carbon Copy",
                  "data-placement": "right"
                }
              },
              [_vm._v("\n            BCC\n          ")]
            ),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.email.bcc,
                  expression: "email.bcc"
                }
              ],
              attrs: {
                name: "bcc",
                placeholder: "BCC",
                type: "email",
                multiple: "true",
                "aria-invalid": _vm.errors.bcc
              },
              domProps: { value: _vm.email.bcc },
              on: {
                keyup: _vm.updateOutputUrl,
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(_vm.email, "bcc", $event.target.value);
                }
              }
            })
          ])
        ]),
        _vm._v(" "),
        _c("label", { attrs: { for: "subject" } }, [
          _vm._v("\n        Subject\n        "),
          _c("input", {
            directives: [
              {
                name: "model",
                rawName: "v-model",
                value: _vm.email.subject,
                expression: "email.subject"
              }
            ],
            attrs: { name: "subject", placeholder: "Subject", type: "text" },
            domProps: { value: _vm.email.subject },
            on: {
              keyup: _vm.updateOutputUrl,
              input: function($event) {
                if ($event.target.composing) {
                  return
                }
                _vm.$set(_vm.email, "subject", $event.target.value);
              }
            }
          })
        ]),
        _vm._v(" "),
        _c("label", { attrs: { for: "body" } }, [
          _vm._v("\n        Body\n        "),
          _c("textarea", {
            directives: [
              {
                name: "model",
                rawName: "v-model",
                value: _vm.email.body,
                expression: "email.body"
              }
            ],
            attrs: {
              name: "body",
              placeholder: "Body",
              type: "text",
              required: ""
            },
            domProps: { value: _vm.email.body },
            on: {
              keyup: _vm.updateOutputUrl,
              input: function($event) {
                if ($event.target.composing) {
                  return
                }
                _vm.$set(_vm.email, "body", $event.target.value);
              }
            }
          })
        ]),
        _vm._v(" "),
        _c("input", {
          attrs: { type: "hidden", id: "final-link-to-copy" },
          domProps: { value: _vm.outputUrl }
        }),
        _vm._v(" "),
        _c("div", { staticClass: "grid gridWithSpace" }, [
          _c(
            "a",
            {
              attrs: { role: "button", href: "#" },
              on: {
                click: function($event) {
                  $event.stopPropagation();
                  $event.preventDefault();
                  return _vm.copyToClipboard($event)
                }
              }
            },
            [_vm._v("\n          Copy to Clipboard\n        ")]
          ),
          _vm._v(" "),
          _c(
            "a",
            {
              staticClass: "outline",
              attrs: {
                role: "button",
                href: _vm.outputUrl,
                target: "_blank",
                "data-tooltip": "Opens in a new tab"
              }
            },
            [_vm._v("\n          Test it!\n        ")]
          )
        ])
      ]),
      _vm._v(" "),
      _vm._m(1)
    ])
  ])
};
var __vue_staticRenderFns__ = [
  function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("hgroup", [
      _c("h2", [
        _vm._v("\n      Create your\n      "),
        _c("code", [_vm._v("mailto")]),
        _vm._v("\n      link quickly!\n    ")
      ]),
      _vm._v(" "),
      _c("h3", [_vm._v("Text formatting utility.")])
    ])
  },
  function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("footer", [
      _vm._v("\n      Built by\n      "),
      _c(
        "a",
        { attrs: { href: "https://github.com/ajitzero", target: "_blank" } },
        [_vm._v("@ajitzero")]
      )
    ])
  }
];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-086dc79e_0", { source: "\n#app {\n  /* lime */\n  --primary: #c0ca33;\n  --primary-hover: #afb42b;\n  --primary-focus: rgba(192, 202, 51, 0.125);\n  --primary-inverse: rgba(0, 0, 0, 0.75);\n\n  font-family: system-ui, sans-serif;\n}\n.outputBox {\n  -ms-user-select: all;\n  -webkit-user-select: all;\n  user-select: all;\n  word-break: break-all;\n}\nhgroup {\n  text-align: center;\n}\ntextarea {\n  min-height: 200px;\n  resize: vertical;\n}\nfooter {\n  text-align: center;\n}\n.gridWithSpace > * {\n  margin-bottom: 1rem;\n}\nbutton,\n[role=\"button\"] {\n  user-select: none;\n}\n", map: {"version":3,"sources":["/tmp/codepen/vuejs/src/pen.vue"],"names":[],"mappings":";AA2MA;EACA,SAAA;EACA,kBAAA;EACA,wBAAA;EACA,0CAAA;EACA,sCAAA;;EAEA,kCAAA;AACA;AACA;EACA,oBAAA;EACA,wBAAA;EACA,gBAAA;EACA,qBAAA;AACA;AACA;EACA,kBAAA;AACA;AACA;EACA,iBAAA;EACA,gBAAA;AACA;AACA;EACA,kBAAA;AACA;AACA;EACA,mBAAA;AACA;AACA;;EAEA,iBAAA;AACA","file":"pen.vue","sourcesContent":["<template>\n  <main id=\"app\" class=\"container\">\n    <hgroup>\n      <h2>\n        Create your\n        <code>mailto</code>\n        link quickly!\n      </h2>\n      <h3>Text formatting utility.</h3>\n    </hgroup>\n\n    <article>\n      <header class=\"outputBox\">\n        <code\n          data-tooltip=\"Click to copy to clipboard\"\n          @click.stop.prevent=\"copyToClipboard\"\n        >\n          {{ outputUrl }}\n        </code>\n      </header>\n\n      <form>\n        <label for=\"target-email-id\">\n          Target Email ID\n          <input\n            name=\"target-email-id\"\n            placeholder=\"Target Email ID\"\n            type=\"email\"\n            multiple=\"true\"\n            :aria-invalid=\"errors.emailId\"\n            v-model=\"emailId\"\n            v-on:keyup=\"updateOutputUrl\"\n          />\n        </label>\n        <div class=\"grid\">\n          <label for=\"cc\">\n            <span data-tooltip=\"Carbon Copy\" data-placement=\"right\">CC</span>\n            <input\n              name=\"cc\"\n              placeholder=\"CC\"\n              type=\"email\"\n              multiple=\"true\"\n              :aria-invalid=\"errors.cc\"\n              v-model=\"email.cc\"\n              v-on:keyup=\"updateOutputUrl\"\n            />\n          </label>\n          <label for=\"bcc\">\n            <span data-tooltip=\"Blind Carbon Copy\" data-placement=\"right\">\n              BCC\n            </span>\n            <input\n              name=\"bcc\"\n              placeholder=\"BCC\"\n              type=\"email\"\n              multiple=\"true\"\n              :aria-invalid=\"errors.bcc\"\n              v-model=\"email.bcc\"\n              v-on:keyup=\"updateOutputUrl\"\n            />\n          </label>\n        </div>\n        <label for=\"subject\">\n          Subject\n          <input\n            name=\"subject\"\n            placeholder=\"Subject\"\n            type=\"text\"\n            v-model=\"email.subject\"\n            v-on:keyup=\"updateOutputUrl\"\n          />\n        </label>\n        <label for=\"body\">\n          Body\n          <textarea\n            name=\"body\"\n            placeholder=\"Body\"\n            type=\"text\"\n            required\n            v-model=\"email.body\"\n            v-on:keyup=\"updateOutputUrl\"\n          ></textarea>\n        </label>\n        <input type=\"hidden\" id=\"final-link-to-copy\" :value=\"outputUrl\" />\n        <div class=\"grid gridWithSpace\">\n          <a role=\"button\" href=\"#\" @click.stop.prevent=\"copyToClipboard\">\n            Copy to Clipboard\n          </a>\n\n          <a\n            role=\"button\"\n            class=\"outline\"\n            :href=\"outputUrl\"\n            target=\"_blank\"\n            data-tooltip=\"Opens in a new tab\"\n          >\n            Test it!\n          </a>\n        </div>\n      </form>\n\n      <footer>\n        Built by\n        <a href=\"https://github.com/ajitzero\" target=\"_blank\">@ajitzero</a>\n      </footer>\n    </article>\n  </main>\n</template>\n\n<script>\nexport default {\n  created() {\n    this.updateOutputUrl();\n  },\n  data() {\n    return {\n      errors: {\n        emailId: false\n        // cc: false,\n        // bcc: false\n      },\n      outputUrl: \"Type something\",\n      emailId: \"you@example.com\",\n      email: {\n        subject: \"Hey there\",\n        cc: \"somebody@example.com\",\n        bcc: \"somebody.else@example.com\",\n        body: \"Hey there, how have you been?\"\n      }\n    };\n  },\n  methods: {\n    updateOutputUrl() {\n      this.outputUrl = this.getOutputUrl();\n    },\n    getOutputUrl() {\n      const remaining = Object.keys(this.email).filter(\n        (key) => this.email[key].trim().length > 0\n      );\n      const errors = [];\n      this.errors.emailId = this.validateEmailField(this.emailId, {\n        required: true\n      });\n      this.errors.cc = this.validateEmailField(this.email.cc);\n      this.errors.bcc = this.validateEmailField(this.email.bcc);\n      if (this.errors.emailId) errors.push(\"Target Email ID\");\n      if (this.errors.cc) errors.push(\"CC\");\n      if (this.errors.bcc) errors.push(\"BCC\");\n      if (errors.length) {\n        return \"Required valid fields: \" + errors.join(\", \") + \".\";\n      }\n      const customFields = remaining\n        .map((key) => `${key}=${encodeURI(this.email[key].trim())}`)\n        .join(\"&\");\n      return (\n        `mailto:${this.emailId}` +\n        (customFields.length ? `?${customFields}` : \"\")\n      );\n    },\n    validateEmailField(value, options) {\n      options = {\n        required: false,\n        ...options\n      };\n      const emails = value\n        .split(\",\")\n        .map((val) => val.trim())\n        .filter(Boolean)\n        .map((val) => this.isValidEmail(val.trim()));\n      if (options.required) {\n        return emails.length === 0 || emails.some((flag) => !flag);\n      }\n      return emails.length != 0 ? emails.some((flag) => !flag) : false;\n    },\n    isValidEmail(email) {\n      return String(email)\n        .toLowerCase()\n        .match(\n          /^(([^<>()[\\]\\\\.,;:\\s@\"]+(\\.[^<>()[\\]\\\\.,;:\\s@\"]+)*)|.(\".+\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$/\n        );\n    },\n    copyToClipboard() {\n      const finalLinkToCopy = document.querySelector(\"#final-link-to-copy\");\n      finalLinkToCopy.setAttribute(\"type\", \"text\");\n      finalLinkToCopy.select();\n      try {\n        const passed = document.execCommand(\"copy\");\n        alert(\n          passed\n            ? \"Copied to clipboard!\"\n            : \"Unable to copy! Please select the text & copy it.\"\n        );\n      } catch (e) {\n        alert(\"Unable to copy! Please select the text & copy it.\");\n      }\n      finalLinkToCopy.setAttribute(\"type\", \"hidden\");\n      window.getSelection().removeAllRanges();\n    }\n  }\n};\n</script>\n\n<style>\n#app {\n  /* lime */\n  --primary: #c0ca33;\n  --primary-hover: #afb42b;\n  --primary-focus: rgba(192, 202, 51, 0.125);\n  --primary-inverse: rgba(0, 0, 0, 0.75);\n\n  font-family: system-ui, sans-serif;\n}\n.outputBox {\n  -ms-user-select: all;\n  -webkit-user-select: all;\n  user-select: all;\n  word-break: break-all;\n}\nhgroup {\n  text-align: center;\n}\ntextarea {\n  min-height: 200px;\n  resize: vertical;\n}\nfooter {\n  text-align: center;\n}\n.gridWithSpace > * {\n  margin-bottom: 1rem;\n}\nbutton,\n[role=\"button\"] {\n  user-select: none;\n}\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = undefined;
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject SSR */

  /* style inject shadow dom */



  const __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
  );

export default __vue_component__;