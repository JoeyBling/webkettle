<%--
  Created by IntelliJ IDEA.
  User: cRAZY
  Date: 2017/4/11
  Time: 17:24
  To change this template use File | Settings | File Templates.
--%>
<%@ page language="java" import="java.util.*" contentType="text/html; charset=UTF-8" pageEncoding="utf-8"%>
<%
  String path = request.getContextPath();
  String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<!DOCTYPE html >
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>精卫-ETL平台--登录</title>
  <link rel="stylesheet" type="text/css" href="<%=basePath%>/css/login.css">
  <link rel="stylesheet" type="text/css" href="<%=basePath%>/css/animate.css">
  <link rel="stylesheet" type="text/css" href="<%=basePath%>/css/common.css">
  <link rel="stylesheet" type="text/css" href="<%=basePath%>/css/dataview.css">
  <link rel="stylesheet" type="text/css" href="<%=basePath%>/css/icon.css">
  <script src="<%=basePath%>/js/jquery.min.js"></script>
  <script type="text/javascript" language="javascript">
    document.onkeydown = function(e){
      var ev = document.all ? window.event : e;
      if(ev.keyCode==13) {
        login();
      }
    }
    var path = "<%=basePath%>";
    function login(){
//            alert( document.getElementById('username').value);
      /*$("#main").ajaxSubmit(function(message) {
       alert(message);
       });*/
      $.ajax({
        url:  path + 'user/doLogin.do',
        type: 'post', dataType: 'text', cache: false, async: false,
        data:$('#main').serialize(),
        success: function (data) {
          if(data == "success"){
            window.location.href = '<%=basePath%>index.jsp';
          }else{
            alert(data);
            reset_form();
          }
        }
      });
    }
    function reset_form()
    {
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
      return false;
    }

    /**
     *取消/关闭DIV
     */
    function closeDiv(item){
      $('#popover-mask'+item).fadeOut(100);
      $('#popover'+item).slideUp(200);
    }
    /**
     * 展示Div
     */
    function showDiv(item){
      $('#popover-mask'+item).fadeIn(100);
      $('#popover'+item).slideDown(200);
    }
  </script>
  <link rel='shortcut icon' href='<%=basePath%>/img/f1_logo_small.ico' type=‘image/x-ico’ />
</head>

<body style="background-color:#e5e5e5">
<div class="login-background-img">
  <img src="<%=basePath%>/img/login_bg.jpg" id="login-bgImg" style="left: 0px;">
</div>
<div class="login_header">
  <div class="main_content">
    <span class="logo"></span>
  </div>
</div>
<div class="login_content main_content">
  <span class="logo"></span>
  <div class="login_iframe">
    <div class="header">登录精卫ETL系统</div>
    <a class="dropdown" href="javascript:void(0);" style="display: none;">
      <span class="dropdown-input"></span>
      <span class="dropdown-icon"><i></i></span>
    </a>
    <form id="main"  action="<%=basePath%>ns1/user_login.action" method="post">
      <table class="lui_login_form_table">
        <tbody>
        <tr>
          <td colspan="2" class="lui_login_message_td">
            <div class="lui_login_message_div">

            </div>
          </td>
        </tr>
        <tr>
          <td class="lui_login_input_title">用户名：</td>
          <td class="lui_login_input_td">
            <div class="lui_login_input_div">
              <input class="lui_login_input_username" style="" type="text" name="username" id="username" value=""/>
            </div>
          </td>
        </tr>
        <tr>
          <td class="lui_login_input_title">密　码：</td>
          <td class="lui_login_input_td">
            <div class="lui_login_input_div">
              <input class="lui_login_input_password" type="password" name="password" id="password" value=""/>
            </div>
          </td>
        </tr>
        <tr>
          <td class="lui_login_button_td" colspan="2">
            <a href="javascript:document.getElementsByName('btn_submit')[0].click();">
              <div class="lui_login_button_div_l">
                <div class="lui_login_button_div_r">
                  <div class="lui_login_button_div_c">登录</div>
                </div>
              </div>
            </a>
          </td>
        </tr>
        </tbody>
      </table>
      <input type="button" style="border: 0px; width: 0px; height: 0px; background: none;" name="btn_submit" onclick="login()">
    </form>
  </div>
</div>

<script type="text/javascript" language="javascript">showDiv('_login');</script>
</body>
</html>
