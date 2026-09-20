import { AppRegistry } from 'react-native';
import App from './src/App';

// Global error handler to prevent silent crash on JS exceptions
if (typeof global !== 'undefined' && global.ErrorUtils) {
  const defaultHandler = global.ErrorUtils.getGlobalHandler && global.ErrorUtils.getGlobalHandler();
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.warn('Unhandled JS Error:', error);
    if (defaultHandler) {
      // Force isFatal to false to prevent Android process kill
      defaultHandler(error, false);
    }
  });
}

AppRegistry.registerComponent('ParentApp', () => App);
