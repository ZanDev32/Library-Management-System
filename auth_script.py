import json, urllib.request, urllib.parse, time
base='http://localhost:8000'
user={'name':'Test User','email':'uat_test_'+str(int(time.time()*1000))+'@example.com','password':'Passw0rd!','role':'student'}
result={}
try:
    req=urllib.request.Request(base+'/auth/register',data=json.dumps(user).encode(),headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=10) as r:
        result['register']=r.read().decode()
except Exception as e:
    result['register']='REGISTER ERROR: '+str(e)
try:
    form = urllib.parse.urlencode({'username': user['email'],'password': user['password']}).encode()
    req=urllib.request.Request(base+'/auth/login',data=form,headers={'Content-Type':'application/x-www-form-urlencoded'})
    with urllib.request.urlopen(req,timeout=10) as r:
        login=r.read().decode(); result['login']=login
        token=json.loads(login)['access_token']
except Exception as e:
    result['login']='LOGIN ERROR: '+str(e)
    token=None
try:
    if token:
        req=urllib.request.Request(base+'/users/me',headers={'Authorization':'Bearer '+token})
        with urllib.request.urlopen(req,timeout=10) as r:
            result['profile']=r.read().decode()
    else:
        result['profile']='SKIPPED'
except Exception as e:
    result['profile']='PROFILE ERROR: '+str(e)
with open('auth_results.txt','w',encoding='utf8') as f:
    json.dump(result,f,indent=2)
