// starting point of any react application
import { React } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'

import App from './App'
import store from './app/store'
// import {store} from './components/newChartTry/stateManagement/store'

ReactDOM.render(
    <Router>
        {/* our entier App wrapped in provider, which means that every single
            component inside the App is going to have access to the store variable */}
        <Provider store={store}>
            <App />
        </Provider>
    </Router>, 
    document.getElementById('root'))