// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: magic;
const url_ListApps = 'http://69.69.0.1/shortcuts/list_apps'
const url_LaunchApps = 'http://69.69.0.1/shortcuts/launch/'
const VPNSettingsUrl = 'App-prefs:root=General&path=VPN/JitStreamer'
var error = false;

function openZTO(){
	const SHORTCUTNAME = "OpenZeroTierOne";
	const XCBURL =  "shortcuts://x-callback-url/run-shortcut"
	let cb = new CallbackURL(XCBURL);
	cb.addParameter("name", SHORTCUTNAME);
	return cb
}

try
{
	await openZTO().open()
} 
catch(e)
{
	let alert = new Alert();
    alert.title = "Do you want to import a shortcut?";
    alert.addCancelAction("No");
    alert.addAction("Yes");
    if (await alert.present() == 0)
    {
		Safari.open("https://www.icloud.com/shortcuts/c2e857225377425f9def7bd2cb45fb99")
    }

}


try{
  	let n = new Notification()
    n.title = "JIT-Stream"
    n.subtitle = "Connecting..."
    n.body = "This can take a few seconds"
    n.schedule()
    
	var req = new Request(url_ListApps);
	req.timeoutInterval = 12;
	var result = await req.loadJSON();
	var list = result.list;
}
catch(e)
{
	log(e)
  	error = true;
    	var n = new Notification()
	n.title = "JIT-Stream"
	n.subtitle = "Failed"
	n.body = "Coulnd't be enabled. Check settings"
	n.schedule()

    let alert = new Alert();
    alert.title = "Configure VPN Settings?";
    alert.addCancelAction("No");
    alert.addAction("Yes");
    if (await alert.present() == 0)
    {
      	Safari.open(VPNSettingsUrl)
    }
}



//Handle vpn disable
if(args.queryParameters.arg == "disable")
{


}



/* -----------------------------------------------

Script      : 
Author      : 
Version     : 
Repository  : 
Description :

----------------------------------------------- */


// file type icons
const ICONS = {
  dir: 		"\uD83D\uDCC1",
  file: 		"\uD83D\uDCC4",
  image:		"\uD83C\uDFDE\uFE0F",
  gear: 		"\u2699",
  app: 		"📱",
  search:	"🔍"
}

// default colors
const COLORS = {
  TITLE : Color.dynamic(Color.black(), Color.white()),
  SUBTITLE: Color.dynamic(Color.darkGray(), Color.lightGray()),
  ERROR: Color.red(),
}

// default font sizes
const FONTS = {
  HEADER: Font.lightMonospacedSystemFont(12),
  TITLE: Font.systemFont(15),
  SUBTITLE: null,
  ERROR: Font.italicSystemFont(10)
}

////////////////////////////////////////////////

class FileBrowser {
  async present() {
    const browser = new UITable()
    browser.showSeparators = true


    const header = new UITableRow()
    header.isHeader = true

	
    var title;
    // prepare list
    let objects = [] // array to store file list
    
    if(error)
    {
		title = "JIT-Stream not Found"
		objects.push( {type:'search', path:"", isDir:false, displayName:"Search", icon: ICONS.search} )

		objects.push( {type:'pref', path:"prefs:root=General", isDir:false, displayName:"VPN Settings", icon: ICONS.gear} )  
		objects.push( {type:'app', path:"", isDir:false, displayName:"Open ZeroTier One", icon: ICONS.app} )  
	} 
	else
  	{
		title = "Enable JIT"
		objects.push( {type:'search', path:"", isDir:false, displayName:"Search", icon: ICONS.search} )  

		for (let i in list) {
			objects.push( {type:'link', path:list[i], isDir:false, displayName:list[i], icon: ICONS.null} )      
		}
	}

    // estimate line height
    const lines = title.split("\n")
    const headerHeight = lines.length*22
    header.height = headerHeight

    const hpath = header.addText(title)
    hpath.titleFont = Font.lightMonospacedSystemFont(12)
    browser.addRow(header)


    	
	





    // add to table
    var selected;
    for( let obj of objects) {
	const row = new UITableRow()

	if (obj.icon) {
		const icon = row.addText( obj.icon )
		icon.widthWeight = 8
	}

	const nameCell = row.addText(obj.displayName, obj.subtitle)
	nameCell.widthWeight = 92
	nameCell.titleColor = obj.titleColor ? obj.titleColor : COLORS.TITLE
      
	
	row.onSelect = (index) => {
		selected = objects[index-1]
	}
	
	browser.addRow(row)
    }

    const fileBrowser = this
    let resp = await browser.present(this.fullscreen)
    
    

    if (!selected) return null

    // action
    if (selected.type == 'link') {
        let n = new Notification()
        n.title = "JIT-Stream"
        n.subtitle = "Enabling..."
        n.body = "This can take a few seconds"
        n.schedule()
        
        
		var req = new Request(url_LaunchApps + selected.path)
        req.method = "post";
        req.headers = {
			"x-something": "foo bar",
        		"Content-Type": "application/json"
        };
        req.body = JSON.stringify({
        		foo: "bar",
        		qux: 42
		});

		var result = await req.loadJSON()  
		log(result)  
		n = new Notification()
         n.title = "JIT-Stream"
//       n.subtitle = "Failed"
		n.body = "JIT enabled. VPN can now be disabled."
		n.addAction("Disable VPN", "scriptable:///run/Notification%20Example?vpn=disable", true)
		n.schedule()

		Script.complete();
    } 
	else if(selected.type == 'pref')
    {
		Safari.open(VPNSettingsUrl)
    }  
	else if(selected.type == 'app')
    {
		await openZTO().open()
    } 
	else if(selected.type == 'search')
    {
		var sAlert = new Alert()
		sAlert.title = "Search"
		sAlert.addTextField()
	    sAlert.addCancelAction("No");
	    sAlert.addAction("Search");
		if (await sAlert.present() == 0)
		{
			//QuickLook.present(sAlert.textFieldValue(0), false)
			const fileBrowser = this
				let resp = await browser.present(this.fullscreen)
		}
    }
  
    return selected
  }  

  //---------------------------------------------
  static async browse(path, {canBrowseParent=true, precheckAccess=true, fullscreen=true}={}) {
  	const f = new FileBrowser()
	await f.present()
  }
}
// ==============================================

module.exports = {FileBrowser}

while (await FileBrowser.browse()) {}


