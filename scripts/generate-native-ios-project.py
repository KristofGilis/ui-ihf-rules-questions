"""Generate the checked-in Xcode project deterministically, without Xcode or npm."""
import hashlib
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1] / "ios/App"
# Keep native UI copy outside the frozen question pack and its saved-quiz hash.
(ROOT / "App/OfflineContent/InterfaceStrings.json").write_bytes(
    (ROOT.parents[1] / "native/strings.json").read_bytes())
objects = []


def identifier(name):
    return hashlib.sha256(name.encode()).hexdigest()[:24].upper()


def object_(name, body):
    key = identifier(name)
    objects.append(f"\t\t{key} /* {name} */ = {{ {body} }};")
    return key


def array(values):
    return "(" + ", ".join(values) + ("," if values else "") + ")"


def configurations(target, settings):
    configs = []
    for mode in ("Debug", "Release"):
        extra = ('SWIFT_OPTIMIZATION_LEVEL = "-Onone"; ENABLE_TESTABILITY = YES; ONLY_ACTIVE_ARCH = YES; SWIFT_ACTIVE_COMPILATION_CONDITIONS = DEBUG;'
                 if mode == "Debug" else 'SWIFT_COMPILATION_MODE = wholemodule; SWIFT_OPTIMIZATION_LEVEL = "-O";')
        configs.append(object_(target + mode, f'isa = XCBuildConfiguration; name = {mode}; buildSettings = {{ {settings} {extra} }};'))
    return object_(target + "Configurations", f'isa = XCConfigurationList; buildConfigurations = {array(configs)}; defaultConfigurationIsVisible = 0; defaultConfigurationName = Release;')


def build_files(folder, phase):
    references, builds = [], []
    for path in sorted((ROOT / folder).glob("*.swift")):
        ref = object_(path.relative_to(ROOT).as_posix(), f'isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = "{path.name}"; sourceTree = "<group>";')
        references.append(ref)
        builds.append(object_(path.relative_to(ROOT).as_posix() + "Build", f'isa = PBXBuildFile; fileRef = {ref};'))
    build = object_(phase, f'isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = {array(builds)}; runOnlyForDeploymentPostprocessing = 0;')
    return references, build


project_id = identifier("Project")
app_id = identifier("AppTarget")
app_refs, app_sources = build_files("App", "AppSources")
test_refs, test_sources = build_files("AppTests", "TestSources")
ui_refs, ui_sources = build_files("AppUITests", "UISources")
resources = []
for name, kind in [("Assets.xcassets", "folder.assetcatalog"), ("OfflineContent", "folder"), ("PrivacyInfo.xcprivacy", "text.xml")]:
    ref = object_(name, f'isa = PBXFileReference; lastKnownFileType = {kind}; path = "{name}"; sourceTree = "<group>";')
    app_refs.append(ref)
    resources.append(object_(name + "Build", f'isa = PBXBuildFile; fileRef = {ref};'))
app_resources = object_("AppResources", f'isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = {array(resources)}; runOnlyForDeploymentPostprocessing = 0;')
sqlite = object_("SystemSQLite", 'isa = PBXFileReference; lastKnownFileType = "sourcecode.text-based-dylib-definition"; name = libsqlite3.tbd; path = usr/lib/libsqlite3.tbd; sourceTree = SDKROOT;')


def frameworks(target):
    build = object_(target + "SQLiteBuild", f'isa = PBXBuildFile; fileRef = {sqlite};')
    return object_(target + "Frameworks", f'isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = ({build},); runOnlyForDeploymentPostprocessing = 0;')


app_product = object_("AppProduct", 'isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = App.app; sourceTree = BUILT_PRODUCTS_DIR;')
test_product = object_("TestProduct", 'isa = PBXFileReference; explicitFileType = wrapper.cfbundle; includeInIndex = 0; path = AppTests.xctest; sourceTree = BUILT_PRODUCTS_DIR;')
ui_product = object_("UIProduct", 'isa = PBXFileReference; explicitFileType = wrapper.cfbundle; includeInIndex = 0; path = AppUITests.xctest; sourceTree = BUILT_PRODUCTS_DIR;')
app_group = object_("AppGroup", f'isa = PBXGroup; path = App; children = {array(app_refs)}; sourceTree = "<group>";')
test_group = object_("TestGroup", f'isa = PBXGroup; path = AppTests; children = {array(test_refs)}; sourceTree = "<group>";')
ui_group = object_("UIGroup", f'isa = PBXGroup; path = AppUITests; children = {array(ui_refs)}; sourceTree = "<group>";')
products = object_("Products", f'isa = PBXGroup; name = Products; children = ({app_product}, {test_product}, {ui_product},); sourceTree = "<group>";')
root_group = object_("Root", f'isa = PBXGroup; children = ({app_group}, {test_group}, {ui_group}, {products}, {sqlite},); sourceTree = "<group>";')
common = 'SDKROOT = iphoneos; SUPPORTED_PLATFORMS = "iphoneos iphonesimulator"; SUPPORTS_MACCATALYST = NO; IPHONEOS_DEPLOYMENT_TARGET = 15.0; CLANG_ENABLE_MODULES = YES; SWIFT_VERSION = 5.0;'
project_config = configurations("Project", common)
app_config = configurations("App", '''ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
    IHF_APP_CODE_SIGN_STYLE = Automatic; IHF_APP_CODE_SIGN_IDENTITY = "Apple Development";
    CODE_SIGN_STYLE = "$(IHF_APP_CODE_SIGN_STYLE)"; CODE_SIGN_IDENTITY = "$(IHF_APP_CODE_SIGN_IDENTITY)";
    PROVISIONING_PROFILE_SPECIFIER = "$(IHF_APP_PROVISIONING_PROFILE)";
    DEVELOPMENT_TEAM = XKF5T9N38M; CURRENT_PROJECT_VERSION = 17; MARKETING_VERSION = 1.0;
    PRODUCT_BUNDLE_IDENTIFIER = io.github.kristofgilis.ihfrulesquiz; PRODUCT_NAME = "$(TARGET_NAME)";
    INFOPLIST_FILE = App/Info.plist; TARGETED_DEVICE_FAMILY = "1,2";
    LD_RUNPATH_SEARCH_PATHS = ("$(inherited)", "@executable_path/Frameworks",);''')
test_config = configurations("Tests", '''CODE_SIGN_STYLE = Automatic; DEVELOPMENT_TEAM = XKF5T9N38M;
    GENERATE_INFOPLIST_FILE = YES; PRODUCT_BUNDLE_IDENTIFIER = io.github.kristofgilis.ihfrulesquiz.tests;
    PRODUCT_NAME = "$(TARGET_NAME)"; TARGETED_DEVICE_FAMILY = "1,2";
    TEST_HOST = "$(BUILT_PRODUCTS_DIR)/App.app/$(BUNDLE_EXECUTABLE_FOLDER_PATH)/App";
    BUNDLE_LOADER = "$(TEST_HOST)"; LD_RUNPATH_SEARCH_PATHS = ("$(inherited)", "@executable_path/Frameworks", "@loader_path/Frameworks",);''')
ui_config = configurations("UITests", '''CODE_SIGN_STYLE = Automatic; DEVELOPMENT_TEAM = XKF5T9N38M;
    GENERATE_INFOPLIST_FILE = YES; PRODUCT_BUNDLE_IDENTIFIER = io.github.kristofgilis.ihfrulesquiz.uitests;
    PRODUCT_NAME = "$(TARGET_NAME)"; TARGETED_DEVICE_FAMILY = "1,2"; TEST_TARGET_NAME = App;''')
app_frameworks = frameworks("App")
test_frameworks = frameworks("Tests")
proxy = object_("AppProxy", f'isa = PBXContainerItemProxy; containerPortal = {project_id}; proxyType = 1; remoteGlobalIDString = {app_id}; remoteInfo = App;')
dependency = object_("AppDependency", f'isa = PBXTargetDependency; target = {app_id}; targetProxy = {proxy};')
object_("AppTarget", f'''isa = PBXNativeTarget; name = App; productName = App; productReference = {app_product};
    productType = "com.apple.product-type.application"; buildConfigurationList = {app_config};
    buildPhases = ({app_sources}, {app_frameworks}, {app_resources},); buildRules = (); dependencies = (); packageProductDependencies = ();''')
tests = object_("TestTarget", f'''isa = PBXNativeTarget; name = AppTests; productName = AppTests; productReference = {test_product};
    productType = "com.apple.product-type.bundle.unit-test"; buildConfigurationList = {test_config};
    buildPhases = ({test_sources}, {test_frameworks},); buildRules = (); dependencies = ({dependency},); packageProductDependencies = ();''')
ui_frameworks = object_("UIFrameworks", 'isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0;')
ui_tests = object_("UITarget", f'''isa = PBXNativeTarget; name = AppUITests; productName = AppUITests; productReference = {ui_product};
    productType = "com.apple.product-type.bundle.ui-testing"; buildConfigurationList = {ui_config};
    buildPhases = ({ui_sources}, {ui_frameworks},); buildRules = (); dependencies = ({dependency},);''')
object_("Project", f'''isa = PBXProject; attributes = {{ LastUpgradeCheck = 2600; TargetAttributes = {{ {app_id} = {{ CreatedOnToolsVersion = 26.0; }}; {tests} = {{ CreatedOnToolsVersion = 26.0; TestTargetID = {app_id}; }}; }}; }};
    buildConfigurationList = {project_config}; compatibilityVersion = "Xcode 15.0"; developmentRegion = en;
    knownRegions = (en, nl, fr, sr, Base,); mainGroup = {root_group}; productRefGroup = {products};
    projectDirPath = ""; projectRoot = ""; packageReferences = (); targets = ({app_id}, {tests}, {ui_tests},);''')
project = ROOT / "App.xcodeproj"
project.mkdir(exist_ok=True)
(project / "project.pbxproj").write_text('// !$*UTF8*$!\n{\n\tarchiveVersion = 1; classes = {}; objectVersion = 60;\n\tobjects = {\n' + "\n".join(objects) + f'\n\t}};\n\trootObject = {project_id};\n}}\n', encoding="utf-8")


def reference(key, name, product_name):
    return f'<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{key}" BuildableName="{product_name}" BlueprintName="{name}" ReferencedContainer="container:App.xcodeproj"/>'


app_ref = reference(app_id, "App", "App.app")
test_ref = reference(tests, "AppTests", "AppTests.xctest")
ui_ref = reference(ui_tests, "AppUITests", "AppUITests.xctest")
scheme = project / "xcshareddata/xcschemes/App.xcscheme"
scheme.parent.mkdir(parents=True, exist_ok=True)
scheme.write_text(f'''<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="2600" version="1.3">
  <BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries>
    <BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES">{app_ref}</BuildActionEntry>
  </BuildActionEntries></BuildAction>
  <TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES"><Testables>
    <TestableReference skipped="NO">{test_ref}</TestableReference>
    <TestableReference skipped="NO">{ui_ref}</TestableReference>
  </Testables></TestAction>
  <LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" debugServiceExtension="internal" allowLocationSimulation="YES"><BuildableProductRunnable runnableDebuggingMode="0">{app_ref}</BuildableProductRunnable></LaunchAction>
  <ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugDocumentVersioning="YES"><BuildableProductRunnable runnableDebuggingMode="0">{app_ref}</BuildableProductRunnable></ProfileAction>
  <AnalyzeAction buildConfiguration="Debug"/>
  <ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/>
</Scheme>
''', encoding="utf-8")
