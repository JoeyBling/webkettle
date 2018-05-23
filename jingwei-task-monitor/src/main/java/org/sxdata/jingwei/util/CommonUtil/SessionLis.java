package org.sxdata.jingwei.util.CommonUtil;

import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;
import java.util.Set;

/**
 * Created by cRAZY on 2017/4/25.
 */
public class SessionLis implements HttpSessionListener{
    @Override
    public void sessionCreated(HttpSessionEvent se) {

    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
       Set<String> set=StringDateUtil.allSession.keySet();
        for(String sessionId:set){
            if(sessionId.equals(se.getSession().getId())){
                StringDateUtil.allSession.remove(sessionId);
                break;
            }
        }
    }
}
