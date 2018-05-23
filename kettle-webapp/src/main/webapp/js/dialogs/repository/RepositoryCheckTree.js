RepositoryCheckTree = Ext.extend(KettleTree, {
	
	loadElement: 3,
	loadUrl: GetUrl('repository/exptree.do'),
	
	initComponent: function() {
	    this.root = new Ext.tree.TreeNode({id: 'test'});
	    
	    this.on('afterlayout', function() {
	    	if(this.getEl().getHeight() < 50) return;	//确保高度已经计算完毕
	    	if(this.getRootNode().id == 'root') return;
	    	
	    	var loader = new Ext.tree.TreeLoader({
				dataUrl: this.loadUrl,
				baseParams: {loadElement: this.loadElement},
				listeners: {
					beforeload: function(l) {
						this.getEl().mask('资源库信息加载中...', 'x-mask-loading');
						
						if(this.filePath)
							l.baseParams.filePath = this.filePath;
					},
					load: function(l, n) {
						this.getEl().unmask();
					},
					scope: this
				}
	    	});
	    	
	    	var root = new Ext.tree.AsyncTreeNode({
	    		id: 'root',
	    		text: '/',
	    		iconCls: 'imageFolder',
	    		checked: false,
	    		expanded: true,
				loader: loader
	    	});
	    	
	    	this.setRootNode(root);
	    }, this);
	    
	    RepositoryCheckTree.superclass.initComponent.call(this);
	    
	    this.on('checkchange', function(node, checked) {
	    	node.expand();
	    	node.eachChild(function(child) {
	    		child.ui.toggleCheck(checked);
	    	});
	    });
	}
});

RepositoryExpWindow = Ext.extend(Ext.Window, {
	width: 400,
	height: 500,
	layout: 'fit',
	modal: true,
	title: '资源库导出',
	loadElement: 3,
	
	initComponent: function() {
		var tree = this.items = new RepositoryCheckTree({loadElement: this.loadElement, border: false});
		
		var ok = function() {
			var data = [];
			Ext.each(tree.getChecked(), function(node) {
				if(node.isLeaf() === true)
					data.push({path: node.attributes.path, type: node.attributes.type});
			});
			
			if(data.length > 0) {
				this.el.mask('正在导出，请稍后...');
				
				Ext.Ajax.request({
					url: GetUrl('repository/exp.do'),
					timeout: 120000,
					params: {data: Ext.encode(data)},
					method: 'POST',
					scope: this,
					success: function(response, opts) {
						try {
							decodeResponse(response, function(resObj) {
								window.open(GetUrl('attachment/download.do?filePath=' + resObj.message + '&remove=true'));
							});
						} finally {
							this.el.unmask();
						}
					},
					failure: failureResponse
				});
			}
		};
		
		this.bbar = ['->', {
			text: '确定', scope: this, handler: ok
		}];
		
		RepositoryExpWindow.superclass.initComponent.call(this);
		this.addEvents('ok');
		
	}
});

RepositoryImpWindow = Ext.extend(Ext.Window, {
	width: 400,
	height: 500,
	layout: 'fit',
	modal: true,
	title: '资源库导如入',
	loadElement: 3,
	
	initComponent: function() {
		var me = this;
		var tree = this.items = new RepositoryCheckTree({loadUrl: GetUrl('repository/imptree.do'), filePath: this.filePath, loadElement: this.loadElement, border: false});
		
		var ok = function() {
			var data = [];
			Ext.each(tree.getChecked(), function(node) {
				if(node.isLeaf() === true)
					data.push({path: node.attributes.path, type: node.attributes.type});
			});
			
			if(data.length > 0) {
				this.el.mask('正在导入，请稍后...');
				
				Ext.Ajax.request({
					url: GetUrl('repository/imp.do'),
					timeout: 120000,
					params: {filePath: this.filePath, data: Ext.encode(data)},
					method: 'POST',
					scope: this,
					success: function(response, opts) {
						try {
							decodeResponse(response, function(resObj) {
								me.fireEvent('ok');
								me.close();
							});
						} finally {
							this.el.unmask();
						}
					},
					failure: failureResponse
				});
			}
		};
		
		this.bbar = ['->', {
			text: '确定', scope: this, handler: ok
		}];
		
		RepositoryImpWindow.superclass.initComponent.call(this);
		this.addEvents('ok');
		
	}
});