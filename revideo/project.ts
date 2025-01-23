import { makeProject } from '@revideo/core';
import './global.css';
import scene from './scene';
import metadata from './metadata.json';

const project = makeProject({
  scenes: [scene],
  variables: metadata,
  settings: {
    shared: {
      size: { x: 1920, y: 1080 },
    },
  },
});

export default project;