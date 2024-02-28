import * as React from 'react';
import { Provider } from 'react-redux';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import { store } from './store';
import AppRouter from './AppRouter';
import { getDesignTokens, CustomTheme, dark } from './theme';
import BackgroundImage from './components/Background/BackgroundImage';
import ErrorBoundary from './components/ErrorBoundary';
import { WormholeConnectConfig } from './config/types';
import { setConfig } from './config';

export interface WormholeConnectProps {
  // theme can be updated at any time to change the colors of Connect
  theme?: CustomTheme;
  // config is only used once, when Connect first mounts, to initialize the global config
  config?: WormholeConnectConfig;
}

export default function WormholeConnect({
  config,
  theme,
}: WormholeConnectProps) {
  // We update the global config once when WormholeConnect is first mounted, if a custom
  // config was provided.
  //
  // We don't allow config changes afterwards because they could lead to lots of
  // broken and undesired behavior.
  React.useEffect(() => {
    if (config) setConfig(config);
  }, []);

  // Handle theme changes at any time
  const muiTheme = React.useMemo(
    () => createTheme(getDesignTokens(theme ?? dark)),
    [theme],
  );

  return (
    <Provider store={store}>
      <ThemeProvider theme={muiTheme}>
        <ScopedCssBaseline enableColorScheme>
          <ErrorBoundary>
            <BackgroundImage>
              <AppRouter />
            </BackgroundImage>
          </ErrorBoundary>
        </ScopedCssBaseline>
      </ThemeProvider>
    </Provider>
  );
}
