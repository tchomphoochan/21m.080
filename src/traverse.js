
import { midi, onMIDISuccess, onMIDIFailure, setMidiInput, setMidiOutput, getMidiIO,
	handleMidiInput, outputMidiID, midiMap, ccMap, stopMap, mute, muted, toggleMute } from "./midiCoder/midi_control.js";
import { Seq, seqs_dict, checkSeqs, _, stopEverything, reset} from './midiCoder/seq_control.js'
import { makingIf, startTern } from "./midiCoder/algorithm_control.js";
import { createStarterText, starterCode } from  "./midiCoder/starterCode.js"
import {floor, ceil, peak, cos, round, trunc, abs} from './midiCoder/midi_math.js';

//run = whether or not to evaluate code
export function traverse(code, tracker = null) {
    let acorn = require('acorn');
    let walk = require('acorn-walk');
    let ast = acorn.parse(code, { ecmaVersion: 'latest' });

    class VariableTracker {
        constructor(prevTracker, parent = null) {
            this.vars = {};
            this.funcNodes = {};
            this.parent = parent;
            this.children = {};
            this.prevTracker = prevTracker;
        }

        getVal(name) {
            let curr = this;
            while (curr != null) {
                if (name in curr.vars) {
                    return curr[name];
                }
                curr = curr.parent;
            }
            return null;
        }

        getFunc(name) {
            let curr = this;
            while (curr != null) {
                if (name in curr.funcNodes) {
                    return curr[name];
                }
                curr = curr.parent;
            }
            return null;
        }

        traverse() {
            //helper 
            function insertIdentifiers(ast) {
                let indices = [];
                function handleIdentifier(node, state) {
                    indices.push([node.name, node.start - ast.start, node.end - ast.start]);
                }

                walk.simple(ast, {
                    Identifier: handleIdentifier,
                });

                let currCode = code.slice(ast.start, ast.end);
                for (let i = indices.length - 1; i >= 0; i--) {
                    let name = indices[i][0]
                    let start = indices[i][1]
                    let end = indices[i][2]
                    currCode = currCode.slice(0, start) + "this.getVal(" + name + ")" + code.slice(end + 1);
                }
                try {
                    eval(currCode);
                } catch (error) {
                    // If eval encounters an error, return undefined
                    console.log("Error evaluating code");
                }
            }

            function evalVar(name, node) {
                let val = this.getVal(name);
                let oldVal = null;

                if (val != null) {
                    try {
                        if (isPlayingSound(val)) {
                            val.stop();
                        }
                    } catch (error) {
                        //no need for action
                    }
                }
                insertIdentifiers(node);
            }
            function getPrevTracker(name) {
                if (name in this.children) {
                    return this.children[name];
                }
            }
            //2nd param = state where vars will be stored but we use whole instance of class
            //3rd param = functions applied when node is of that type
            walk.recursive(ast, this, {
                FunctionDeclaration(node) {
                    // Store the function node and parameters temporarily (wait to traverse until function called)
                    let changed = state.prevTracker == null || state.prevTracker.funcNodes[funcName].node != node;
                    state.funcNodes[node.id.name] = {
                        node: node,
                        params: node.params.map((param) => param.name),
                        changed: changed
                    }
                },

                CallExpression(node, state) {
                    const funcName = node.callee.name;
                    //Check if name in funcNodes
                    const funcNode = state.getFunc(funcName);
                    if (funcNode && !funcNode.changed) {
                        state.children[funcName] = prevTracker.children[funcNode];
                    }
                    else if (funcNode) {
                        //create new tracker to store info about function params & args
                        const funcScopeTracker = new VariableTracker(null, state);
                        state.children[funcName] = funcScopeTracker;
                        for (let i = 0; i < funcNode.params.length; i++) {
                            // Add function parameters to the current scope
                            const paramName = funcNode.params[i].name;
                            const argValue = node.arguments[i];
                            funcScopeTracker.vars[paramName] = argValue;
                        }
                        funcScopeTracker.traverse(funcNode.node.body);
                    }
                    else {
                        evaluate(node);
                    }
                },

                VariableDeclarator(node, state) {
                    if (node.init) {
                        const name = node.id.name;
                        evalVar(name, node);
                    }
                },

                AssignmentExpression(node, state) {
                    if (node.left.type === "Identifier") {
                        const name = node.left.name;
                        evalVar(name, node);
                    }
                },

                default: (node, state) => {

                }
            });
        }
    }
}

/*EXAMPLE
  const code = `
      const a = 10;
      let b = 20;
      a = 30;
  `;
  const ast = acorn.parse(code);
  const variableTracker = new VariableTracker();
  variableTracker.traverse(ast);
  console.log(variableTracker.vars);

  RESULT:
  {
      a: { type: 'Literal', start: 10, end: 12, value: 30, raw: '30' },
      b: { type: 'Literal', start: 25, end: 27, value: 20, raw: '20' }
  }

*/

/* TO CONSIDER
Should we eval during traversal and store vals in this.vars OR continue storing WHOLE nodes
  Maybe we include an optional param for evaluating during 

How are if, for, while read?

How should scope be dealt with? 

When block is evaluated, can it be a block within another block?
What if line affects code in other parts like loops

*/
