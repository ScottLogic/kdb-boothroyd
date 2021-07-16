import React, { RefObject } from 'react';
import ReactDom from 'react-dom';
import * as monaco from 'monaco-editor';

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const containerElement = document.createElement('div');
document.body.appendChild(mainElement);



type MyAppProps = unknown;
type MyAppState = unknown;

class App extends React.Component<MyAppProps, MyAppState> {
  myRef: RefObject<HTMLDivElement>;

  constructor(props: MyAppProps) {
    super(props);

    this.myRef = React.createRef();
  }

  componentDidMount() {
    monaco.editor.create(this.myRef.current!, {
      value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join(
        '\n'
      ),
      language: 'javascript',
    });
  }

  render() {
      return <div ref={this.myRef} style={{ height: '100vh' }} />;
  }
}

ReactDom.render(<App />, mainElement);
