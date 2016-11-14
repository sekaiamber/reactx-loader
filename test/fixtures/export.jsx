const React = require('react')

import ExportComponent from './export.reactx'

export default class Index extends React.Component {
  render() {
    return (
      <div id="workspace">
        <ExportComponent />
      </div>
    )
  }
}