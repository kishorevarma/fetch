import React, { Fragment, Timeout } from "react";
import { Fetch, set, get } from "@reactions/fetch";
import Component from "@reactions/component";
import { getToken, api } from "./utils";

export default class App extends Component {
  render() {
    return (
      <Timeout ms={1000}>
        {didTimeout =>
          didTimeout ? (
            <div>Loading...</div>
          ) : (
            <Fragment>
              <Header />
              <NewContactForm />
              <ContactList />
              <Stats />
            </Fragment>
          )
        }
      </Timeout>
    );
  }
}

const FORM_WIDTH = 300;
const HEADER_HEIGHT = 30;
const MONKEY = "https://contacts.now.sh/images/monkey.jpg";

const TextButton = props => (
  <button
    {...props}
    style={{
      border: "none",
      display: "inline-block",
      background: "none",
      font: "inherit",
      fontSize: "85%",
      color: "hsl(200, 50%, 50%)",
      textDecoration: "underline",
      margin: 0,
      padding: 0,
      cursor: "pointer"
    }}
  />
);

const ContactList = () => (
  <Timeout ms={10}>
    {didTimeout => (
      <Fetch url={`${api}/contacts`} headers={{ authorization: getToken() }}>
        {({ data, invalidate }) => (
          <Component
            length={data.contacts.length}
            didUpdate={({ prevProps, props }) => {
              const addedContact = props.length > prevProps.length;
              if (addedContact) {
                window.scrollTo(0, document.body.scrollHeight);
              }
            }}
          >
            <ul
              style={{
                padding: `${HEADER_HEIGHT}px 10px 10px ${FORM_WIDTH + 10}px`,
                paddingBottom: "40px",
                opacity: didTimeout ? "0.5" : ""
              }}
            >
              {data.contacts.map(contact => (
                <Component
                  key={contact.id}
                  initialState={{ deleting: false, error: null }}
                >
                  {({ state, setState }) => (
                    <li
                      style={{
                        display: "flex",
                        alignItems: "center",
                        opacity: state.deleting ? "0.5" : "",
                        transition: "opacity 100ms ease-in-out",
                        margin: "20px 0"
                      }}
                    >
                      <div
                        role="img"
                        style={{
                          height: "75px",
                          width: "75px",
                          backgroundImage: `url(${contact.avatar})`,
                          backgroundSize: "cover",
                          borderRadius: "50%"
                        }}
                      />
                      <div style={{ margin: "0 10px" }}>
                        <div>
                          {contact.first} {contact.last}
                        </div>
                        <TextButton
                          disabled={state.deleting}
                          onClick={async () => {
                            setState({ deleting: true });
                            const res = await fetch(
                              `${api}/contacts/${contact.id}`,
                              {
                                method: "delete",
                                headers: {
                                  authorization: getToken()
                                }
                              }
                            );
                            if (res.ok) {
                              invalidate();
                              setState({ deleting: false });
                            } else {
                              const text = await res.text();
                              setState({ deleting: false, error: text });
                            }
                          }}
                        >
                          delete
                        </TextButton>
                        {state.error && (
                          <span style={{ fontSize: "85%", color: "red" }}>
                            {" "}
                            {state.error}
                          </span>
                        )}
                      </div>
                    </li>
                  )}
                </Component>
              ))}
            </ul>
          </Component>
        )}
      </Fetch>
    )}
  </Timeout>
);

const Field = ({ title }) => (
  <label
    style={{
      display: "block",
      margin: "20px 0"
    }}
  >
    <b style={{ fontSize: "85%", color: "#888" }}>{title}</b>
    <br />
    <input
      type="text"
      style={{
        fontSize: "125%",
        width: "100%"
      }}
    />
  </label>
);

const NewContactForm = () => (
  <Component initialState={{ error: null }}>
    {({ setState, state }) => (
      <form
        style={{
          position: "fixed",
          left: 0,
          top: `${HEADER_HEIGHT}px`,
          bottom: 0,
          background: "#f0f0f0",
          width: `${FORM_WIDTH}px`,
          padding: "20px"
        }}
        onSubmit={async event => {
          event.preventDefault();
          const form = event.target;
          const contact = {
            first: form.elements[0].value || "Noname",
            last: form.elements[1].value || "McGee",
            avatar: form.elements[2].value || MONKEY,
            id: Math.random()
              .toString(32)
              .substr(6)
          };
          const url = `${api}/contacts`;

          // optimistically update
          const data = get(url);
          set(url, { contacts: data.contacts.concat([contact]) });

          form.reset();

          const res = await fetch(url, {
            method: "post",
            headers: new Headers({
              "Content-Type": "application/json",
              authorization: getToken()
            }),
            body: JSON.stringify({ contact })
          });

          if (!res.ok) {
            // put back the optimism
            // (You can trigger this by sending a first name "Millenial")
            set(url, data);
            setState({ error: await res.text() });
          }
        }}
      >
        <p>
          <Field title="First Name" />
          <Field title="Last Name" />
          <Field title="Avatar URL" />
        </p>
        <button
          type="submit"
          style={{
            margin: "10px 0",
            border: "none",
            borderRadius: "100em",
            font: "inherit",
            fontWeight: "bold",
            fontSize: "85%",
            color: "white",
            padding: "10px 20px",
            background: "hsl(200, 50%, 50%)",
            width: "100%"
          }}
        >
          Create Contact
        </button>
        <ul style={{ fontSize: "85%", padding: "10px" }}>
          <li>To cause an error, try using the first name "Millenial"</li>
          <li>
            For randomly slow responses use the browser debugger to throttle
            your network.
          </li>
        </ul>
        {state.error && (
          <p
            style={{
              background: `hsl(10, 50%, 90%)`,
              border: `solid 1px hsl(10, 50%, 50%)`,
              padding: "10px",
              textAlign: "center"
            }}
          >
            There was an error:<br />
            <br />
            <b>{state.error}</b>
          </p>
        )}
      </form>
    )}
  </Component>
);

const Stats = () => (
  <Fetch url={`${api}/contacts`} headers={{ authorization: getToken() }}>
    {({ data }) => (
      <div
        style={{
          position: "fixed",
          bottom: "0",
          left: `${FORM_WIDTH}px`,
          right: 0,
          textAlign: "center",
          padding: "10px",
          borderTop: "solid 1px #f0f0f0",
          background: "white"
        }}
      >
        {data.length === 1 ? (
          <span>You have {data.contacts.length} contact</span>
        ) : (
          <span>You have {data.contacts.length} contacts</span>
        )}
      </div>
    )}
  </Fetch>
);

const A = props => (
  // eslint-disable-next-line
  <a
    style={{ color: "white", textDecoration: "none", margin: "0 10px" }}
    {...props}
  />
);

const Header = () => (
  <div
    style={{
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      zIndex: 1,
      background: "#333",
      height: `${HEADER_HEIGHT}px`,
      color: "white",
      display: "flex",
      flexDirection: "column"
    }}
  >
    <div
      style={{
        margin: "auto",
        width: "100%",
        padding: "0 15px",
        display: "flex",
        justifyContent: "space-between"
      }}
    >
      <div>
        <A href="https://github.com/reactions">Reactions</A>/<A href="https://github.com/reactions/fetch">
          Fetch
        </A>
      </div>
      <div>
        <A href="https://workshop.me">Workshops</A>{" "}
        <A href="https://totalreact.com">Online Courses</A>{" "}
        <A href="https://twitter.com/ryanflorence">Twitter</A>
      </div>
    </div>
  </div>
);
