<?php
class Comm100_Livechat_Adminhtml_LivechatController extends Mage_Adminhtml_Controller_action
{
 
	public function indexAction() {
		
		//set install flag
    	$this->checkInstallStatus();
    	
    	//clear cache
		Mage::app()->cleanCache();

		$block = $this->getLayout()->createBlock(
			'Mage_Core_Block_Template',
			'livechat_config',
			array('template' => 'comm100/livechat_config.phtml')
		);
		
		$this->loadLayout()
			->_setActiveMenu('livechat')
			->_addContent($block)
			->renderLayout();
	}
	
	private function checkInstallStatus()
	{
		Mage::log('checkInstallStatus', null, "comm100.log"); 
		$installFlag = intval($this->getInstallFlag());
		Mage::log('getInstallFlag flag is '.$installFlag, null, "comm100.log"); 
		$installFlag = $installFlag + 1;
		$this->setInstallflag($installFlag);
	}
	
	private function getInstallFlag()
	{
		$config_table = Mage::getSingleton('core/resource')->getTableName('core_config_data');
		Mage::log('install flag $config_table is '.$config_table, null, "comm100.log"); 
		$read = Mage::getSingleton('core/resource')->getConnection('core_read');
		$query = 'SELECT * FROM ' . $config_table;
		$query .= ' WHERE scope="default" AND scope_id=0 AND path="comm100/advanced/installflag" ';
		$results = $read->fetchAll($query);
		if ($row = array_pop($results)) {
			Mage::log('have exist config record, value is '.$row['value'], null, "comm100.log"); 
			return $row['value'];
		}
		
		Mage::log('not have exist config record ', null, "comm100.log"); 
		
		return 0;
	}
	
	private function setInstallflag($installFlag)
	{
		try 
		{
			Mage::log('setInstallflag flag is '.$installFlag, null, "comm100.log"); 
			$config_table = Mage::getSingleton('core/resource')->getTableName('core_config_data');
			Mage::log('$config_table is '.$config_table, null, "comm100.log"); 
			$read = Mage::getSingleton('core/resource')->getConnection('core_read');
			$query = 'SELECT * FROM ' . $config_table;
			$query .= ' WHERE scope="default" AND scope_id=0 AND path="comm100/advanced/installflag" ';
			$results = $read->fetchAll($query);
			$write = Mage::getSingleton('core/resource')->getConnection('core_write');
			//check for existing configurations
			if ($row = array_pop($results)) {
				$config_id = $row['config_id'];
				Mage::log('install flag $config id is '.$config_id, null, "comm100.log"); 
				$query = 'UPDATE ' . $config_table;
				$query .= ' SET value="' . $installFlag . '"';
				$query .= ' WHERE config_id=' . $config_id;
				$write->query($query);
			
			} else {
				Mage::log('no exist config ', null, "comm100.log"); 
				$query = 'INSERT INTO ' . $config_table;
				$query .= ' (scope, scope_id, path, value)';
				$query .= ' VALUES ("default", 0, "comm100/advanced/installflag", "' . $installFlag . '")';
				$write->query($query);
			}
		}
		catch(Exception $ex)
		{
			Mage::log($ex->getMessage(), null, "comm100.log"); 
		}
	}
	
	public function postAction() {
		
		Mage::log('Action post', null, "comm100.log");   
		
		!isset($_POST['actiontype']) ? $actiontype = '' : $actiontype = $_POST['actiontype']; 
		
		Mage::log($actiontype, null, "comm100.log");
		
		if($actiontype=="link")
		{
			$this->processPostData();
		}
		else
		if($actiontype=="unlink")
		{
			$this->updateConfigData('','','0','0','0','');
		}
		
		//echo '{result:"1"}';
		//clear cache
		Mage::app()->cleanCache();
		$this->_redirect('*/*/index');
	}
	
	private function processPostData()
	{
		//avoid notices warnings
		!isset($_POST['email']) ? $email = '' : $email = $_POST['email']; 
		!isset($_POST['password']) ? $password = '' : $password = $_POST['password'];  
		!isset($_POST['plan_id']) ? $plan_id = '0' : $plan_id = $_POST['plan_id'];  
		!isset($_POST['plan_type']) ? $plan_type = '0' : $plan_type = $_POST['plan_type']; 
		!isset($_POST['site_id']) ? $site_id = '0' : $site_id = $_POST['site_id']; 

		//decode
		$email = urldecode($email);
		
		Mage::log('$site_id='.$site_id.'$plan_id='.$plan_id, null, "comm100.log"); 
		
		$this->updateConfigData($email,$password,$site_id,$plan_id,$plan_type);
		
	}
	
	private function updateConfigData($email,$password,$site_id,$plan_id,$plan_type)
	{
		try 
		{
		$config_table = Mage::getSingleton('core/resource')->getTableName('core_config_data');
		Mage::log('$config_table is '.$config_table, null, "comm100.log"); 
		$read = Mage::getSingleton('core/resource')->getConnection('core_read');
		$query = 'SELECT * FROM ' . $config_table;
		$query .= ' WHERE scope="default" AND scope_id=0 AND path="comm100/general/planid" ';
		$results = $read->fetchAll($query);

		$write = Mage::getSingleton('core/resource')->getConnection('core_write');

		//check for existing configurations
		if ($row = array_pop($results)) {
		
			$config_id = $row['config_id'];
			
			Mage::log('exist config siteid is '.$config_id, null, "comm100.log"); 
			
			$query = 'UPDATE ' . $config_table;
			$query .= ' SET value="' . $plan_id . '"';
			$query .= ' WHERE config_id=' . $config_id;
			$write->query($query);
			
			$query = 'UPDATE ' . $config_table;
			$query .= ' SET value="' . $plan_type . '"';
			$query .= ' WHERE config_id=' . ++$config_id;
			$write->query($query);
			
			$query = 'UPDATE ' . $config_table;
			$query .= ' SET value="' . $site_id . '"';
			$query .= ' WHERE config_id=' . ++$config_id;
			$write->query($query);
			
			$query = 'UPDATE ' . $config_table;
			$query .= ' SET value="' . $email . '"';
			$query .= ' WHERE config_id=' . ++$config_id;
			$write->query($query);
			
			$query = 'UPDATE ' . $config_table;
			$query .= ' SET value="' . $password . '"';
			$query .= ' WHERE config_id=' . ++$config_id;
			$write->query($query);
			
			$query = 'UPDATE ' . $config_table;
			$query .= ' SET value=""';
			$query .= ' WHERE config_id=' . ++$config_id;
			$write->query($query);
		} else {
			
			Mage::log('no exist config ', null, "comm100.log"); 
			
			$query = 'INSERT INTO ' . $config_table;
			$query .= ' (scope, scope_id, path, value)';
			$query .= ' VALUES ("default", 0, "comm100/general/planid", "' . $plan_id . '"),';
			$query .= ' ("default", 0, "comm100/general/plantype", "'. $plan_type .'"),';
			$query .= ' ("default", 0, "comm100/general/siteid", "'. $site_id .'"),';
			$query .= ' ("default", 0, "comm100/general/email", "'. $email .'"),';
			$query .= ' ("default", 0, "comm100/general/password", "'. $password .'"),';
			$query .= ' ("default", 0, "comm100/general/code", "")';
			$write->query($query);
		}
		}
		catch(Exception $ex)
		{
			Mage::log($ex->getMessage(), null, "comm100.log"); 
		}
	}
}