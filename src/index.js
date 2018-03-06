import React from "react";
import Component from "@reactions/component";

const parseJson = response => response.json();
const anHour = 1000 * 60 * 60;

const cache = {};
const pending = {};
const invalidations = {};

export const createFetch = (url, opts) => {
  const { expires = anHour, parse = parseJson, ...options } = opts;

  return {
    read: () => {
      if (cache[url] && cache[url].expires < Date.now()) {
        delete cache[url];
      }

      if (cache[url]) {
        return cache[url].value;
      } else if (pending[url]) {
        throw pending[url];
      } else {
        const expireAt = Date.now() + expires;
        const promise = fetch(url, options)
          .then(res => parse(res))
          .then(data => {
            cache[url] = { value: data, expires: expireAt };
            delete pending[url];
            return data;
          });
        pending[url] = promise;
        throw promise;
      }
    },
    invalidate: otherUrls => {
      const urls = otherUrls ? [url, ...otherUrls] : [url];
      urls.forEach(url => invalidate(url));
    },
    set: data => {
      set(url, data);
    }
  };
};

const mount = (url, fn) => {
  if (!invalidations[url]) {
    invalidations[url] = [];
  }
  invalidations[url].push(fn);
};

const unmount = (url, fn) => {
  const index = invalidations[url].indexOf(fn);
  invalidations[url].splice(index, 1);
};

export const set = (url, value, expires) => {
  const expiresAt = expires || Date.now() + anHour;
  cache[url] = { value, expires: expiresAt };
  invalidations[url].forEach(fn => fn());
};

export const get = url => {
  return cache[url] ? cache[url].value : undefined;
};

export const invalidate = url => {
  delete cache[url];
  invalidations[url].forEach(fn => fn());
};

export const Fetch = ({ url, children, ...opts }) => (
  <Component
    didMount={({ forceUpdate }) => mount(url, forceUpdate)}
    willUnmount={({ forceUpdate }) => unmount(url, forceUpdate)}
  >
    {() => {
      const resource = createFetch(url, opts);
      const data = resource.read();
      return children({
        invalidate: resource.invalidate,
        set: resource.set,
        data
      });
    }}
  </Component>
);
