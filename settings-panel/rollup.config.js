import node from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import minify from 'rollup-plugin-babel-minify';

const input = 'dist/index.js';
const name = 'NFigUI';
const external = ['react', 'react-dom'];
const format = 'umd';
const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
};

const plugins = [
  node({
    jsnext: true,
    main: true,
  }),
  commonjs({
    sourceMap: false,
    namedExports: {
      'mobx-react': ['observer', 'inject', 'Provider'],
      'mobx-utils': ['asyncAction'],
    },
  }),

  babel({
    plugins: ['emotion'],
  }),
];

const replaceEnv = env => replace({ 'process.env.NODE_ENV': `'${env}'` });

export default [
  {
    input,
    name,
    external,
    output: {
      file: 'settings-panel.js',
      format,
      globals,
    },
    plugins: [replaceEnv('development'), ...plugins],
  },
  {
    input,
    name,
    external,
    output: {
      file: 'settings-panel.min.js',
      format,
      globals,
    },
    plugins: [
      replaceEnv('production'),
      ...plugins,
      minify({ comments: false }),
    ],
  },
];
