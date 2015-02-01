import { INLINE_PARTIAL } from 'config/types';
import escapeRegExp from 'utils/escapeRegExp';

export default readPartialDefinitionComment;

var startPattern = /^<!--\s*/,
    namePattern = /s*>\s*([a-zA-Z_$][-a-zA-Z_$0-9]*)\s*/,
    finishPattern = /\s*-->/;

function readPartialDefinitionComment ( parser ) {
	let template = parser.remaining(),
	    firstPos = parser.pos,
	    open = parser.standardDelimiters[0],
	    close = parser.standardDelimiters[1];

	if ( !parser.matchPattern( startPattern ) || !parser.matchString( open ) ) {
		parser.pos = firstPos;
		return null;
	}

	let name = parser.matchPattern( namePattern );

	// make sure the rest of the comment is in the correct place
	if ( !parser.matchString( close ) || !parser.matchPattern( finishPattern ) ) {
		parser.pos = firstPos;
		return null;
	}

	// look for the closing partial for name
	let end = new RegExp('<!--\\s*' + escapeRegExp( open ) + '\\s*\\/\\s*' + name + '\\s*' + escapeRegExp( close ) + '\\s*-->');
	template = parser.remaining();
	let endMatch = end.exec( template );

	if ( !endMatch ) {
		throw new Error( 'Inline partials must have a closing delimiter, and cannot be nested. Expected closing for "' + name +
			'", but ' + ( endMatch ? 'instead found "' + endMatch[1] + '"' : ' no closing found' ) );
	}

	// TODO is it better to spin up a new parser, or use the existing one?
	let partial = {
		t: INLINE_PARTIAL,
		f: new parser.StandardParser( template.substr( 0, endMatch.index ), parser.options ).result,
		n: name
	};

	parser.pos += endMatch.index + endMatch[0].length;

	return partial;
}
