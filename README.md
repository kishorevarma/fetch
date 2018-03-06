# Reactions Fetch

Declarative Fetch component for React Suspense.

## 🚨 EXPERIMENTAL 🚨

Ayyyyyyyyyyyyyyyyyyyyyyyyyyyyyy

So this is totally experimental. The React API's this component uses are unstable and will change. We’re all still learning what they even mean! But that doesn't mean we can't play around with them and figure out how to make them even better. So come along, but beware!

## Installation

```bash
npm install @reactions/fetch
# or
yarn add @reactions/fetch
```

And then import it:

```js
// using es modules
import Component from "@reactions/fetch";

// common.js
const Component = require("@reactions/fetch");

// AMD
// I've forgotten but it should work.
```

Or use script tags and globals.

```html
<script src="https://unpkg.com/@reactions/fetch"></script>
```

And then grab it off the global like so:

```js
const Component = ReactionsFetch;
```

## How To

Reading and invalidating a path:

```jsx
<Fetch path="https://api.gitub.com/gists">
  {({ data, invalidate }) => (
    <div>
      <button onClick={invalidate}>Refresh</button>
      <ul>{data.map(gist => <li>{gist.description}</li>)}</ul>
    </div>
  )}
</Fetch>
```

Optimistically updating a path.

```jsx
<Fetch path="/projects">
  {({ data, set, invalidate }) => (
    <ul>
      {data.map(item => (
        <li>
          {item.title}{" "}
          <button
            onClick={async () => {
              set("/projects", items.filter(alleged => alleged.id !== item.id));
              const res = await fetch(`/projects/${item.id}`, {
                method: "delete"
              });
              if (!res.ok) {
                alert(`Failed to delete ${item.id}`);
                invalidate(); // refetches from source
              }
            }}
            aria-label="delete"
          >
            ⨉
          </button>
        </li>
      ))}
    </ul>
  )}
</Fetch>
```

Check out the [example](/example) for more. It's running <a href="https://reactions.github.io/fetch">here</a>.

## Legal

Released under MIT license.

Copyright &copy; 2018-present Ryan Florence
