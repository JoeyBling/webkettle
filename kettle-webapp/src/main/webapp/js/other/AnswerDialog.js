AnswerDialog = Ext.extend(Ext.Window, {
	width: 400,
	height: 140,
	modal: true,
    closeAction: 'close',
	title: '问题',
	bodyStyle: 'padding: 15px;',
	
	initComponent: function() {
		var me = this;
		
		this.bbar = ['->',
		{
			text : '增加新的',
			handler : function() {
				me.fireEvent('addNew');
				me.close();
			}
		},'-',{
			text : '增加所有',
			handler : function() {
				me.fireEvent('addAll');
				me.close();
			}
		},'-',{
			text : '清除并增加所有',
			handler : function() {
				me.fireEvent('clearAddAll');
				me.close();
			}
		},'-',{
			text : '取消',
			handler : function() {
				me.close();
			}
		}];
		
		AnswerDialog.superclass.initComponent.call(this);
		this.addEvents('addNew', 'addAll', 'clearAddAll');
	},
	
	afterRender: function() {
		AnswerDialog.superclass.afterRender.call(this);
		
		var tpl = new Ext.XTemplate(
		    '<table style="width:100%;height:100%"><tr>',
		    '<td width="48" align="center" valign="center"><img src="',
		    GetUrl("ui/resources/icon-warning.gif"),
		    '"></td>',
		    '<td><span style="font-size: 13px">表中已经有{has}行数据，如何处理新找到的{found}列？</span></td>',
		    '</tr></table>',
		    {
		    	 compiled: true
		    }
		);
		tpl.overwrite(this.body, {has: this.initialConfig.has, found: this.initialConfig.found});
	}
});