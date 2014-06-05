import optionConfig from 'config/options/option';

export default function parseConfig ( name ) {

	var config = optionConfig( name );

	config.postInit = ( target, result ) => {
		target.parseOptions[ name ] = result;
	};

	return config;
}