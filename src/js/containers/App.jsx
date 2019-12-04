import React, { Component } from 'react'
import { hot } from 'react-hot-loader'
import { observer } from 'mobx-react'

import ModeController from './ModeController'
import BuildMode from './BuildMode'
import AnimateMode from './AnimateMode'
import ViewMode from './ViewMode'
import ExportMode from './ExportMode'
import Grid from '../components/Grid'

@observer
class App extends Component {
  componentDidMount() {
    const { store } = this.props
    store.mode.set('BUILD')
    // store.canvas.setTool('SETTINGS')
  }

  render() {
    const { store } = this.props
    return (
      <Grid
        minHeight="100vh"
        gridTemplateRows="60px 1fr"
      >
        <ModeController mode={store.mode} />
        {store.mode.current === 'BUILD' &&
          <BuildMode store={store} />
        }
        {store.mode.current === 'ANIMATE' &&
          <AnimateMode store={store} />
        }
        {store.mode.current === 'VIEW' &&
          <ViewMode store={store} />
        }
        {store.mode.current === 'EXPORT' &&
          <ExportMode store={store} />
        }
      </Grid>
    )
  }
}

export default hot(module)(App)
