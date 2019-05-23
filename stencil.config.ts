import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'flixcharter-affiliate',
  outputTargets:[
    { type: 'dist' },
    { type: 'docs' },
    {
      type: 'www',
      serviceWorker: null // disable service workers
    }
  ],
  copy: [
    { 
      src: '../node_modules/@flixbus/honeycomb/dist/font/*',
      dest: 'font',
    },
    {
      src: 'imgs',
    }
  ],
  globalStyle: 'node_modules/@flixbus/honeycomb/dist/css/honeycomb.min.css',
  plugins: [
    sass(),
  ]
};
