DatabaseExplorerDialog = Ext.extend(Ext.Window, {
	title: '数据库浏览',
	width: 400,
	height: 550,
	closeAction: 'close',
	modal: true,
	layout: 'fit',
	
	includeElement: 15,
	
	initComponent: function() {
		var me = this;
		
		var tree = new KettleTree({
			border: false,
			root: new Ext.tree.TreeNode({text: 'root'}),
			rootVisible: false
		});
		
		this.initDatabase = function(databaseInfo) {
			var loader = new Ext.tree.TreeLoader({
				dataUrl: GetUrl('database/explorer.do'),
				baseParams: {databaseInfo: /*Ext.encode(databaseInfo)*/databaseInfo, includeElement: this.includeElement,transName:activeGraph.title}
			});
			
			var root = new Ext.tree.AsyncTreeNode({
				text: 'root',
				iconCls: 'imageFolder',
				loader: loader
			});
			
			loader.on('beforeload', function(l, node) {
				if(node == root) 
					l.baseParams.nodeId = null;
				else
					l.baseParams.nodeId = node.attributes.nodeId;
				
				l.baseParams.text = node.text;
			});
			
			tree.setRootNode(root);
		};
		
		var bCancel = new Ext.Button({
			text: '取消', scope: this, handler: function() {
				me.close();
			}
		});
		var bOk = new Ext.Button({
			text: '确定', scope: this, handler: function() {
				var node = tree.getSelectionModel().getSelectedNode();
				if(!node) {
					alert('请选择节点！');
					return;
				}
				if(!node.isLeaf()) {
					alert('请选择有效节点！');
					return;
				}
				
				me.fireEvent('select', node.text, node.attributes.nodeId);
			}
		});
		
		this.bbar = ['->', bCancel, bOk];
		this.items = tree;
		
		DatabaseExplorerDialog.superclass.initComponent.call(this);
		this.addEvents('select');
	}
});