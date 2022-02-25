<?php
header("Access-Control-Allow-Origin: *");
set_time_limit(-1);
// search.php?server=&type=search&name=
// $_GET['type'] = 'lyric';
// $_GET['id'] = '857619';

// $_GET['type'] = 'search';
// $_GET['name'] = '深海少女';

 // $_GET['type'] = 'cover';
 // $_GET['id'] = '18722483998223156';
// $_GET['id'] = '897784673';
// $_GET['server'] = 'netease';
// $_GET['type'] = 'playlist';

$type = getParam('type');
$server = getParam('server');
require_once('./Meting.php');
use Metowolf\Meting;
$api = new Meting($server);
$api->format(true);

switch ($type) {
	case 'playlist':
		echo $api->playlist(getParam('id'));
		break;
	case 'cover':
		echo header('location:' . json_decode($api->pic(getParam('id')), true)['url']);
		break;

	case 'lyric':
		echo $api->lyric(getParam('id'));
		break;

	case 'search':
		echo $api->search(getParam('name'));
		break;

	case 'url':
		echo header('location:' . json_decode($api->url(getParam('id')), true)['url']);
		break;

	default:
		break;
}

function getParam($key, $default=''){
    return trim($key && is_string($key) ? (isset($_POST[$key]) ? $_POST[$key] : (isset($_GET[$key]) ? $_GET[$key] : $default)) : $default);
}
