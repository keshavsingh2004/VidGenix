import { makeProject } from '@revideo/core';

import './global.css';
import metadata from './metadata.json';

import scene from './scene';

export default makeProject({
  scenes: [scene],
  variables: metadata,
  settings: {
    shared: {
      size: { x: 1920, y: 1080 },
    },
  },
});
