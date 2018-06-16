using System;
using System.Reflection;
using System.IO;

namespace NFig.UI
{
    public static class NFigUI
    {
        static readonly Lazy<string> _devScript = new Lazy<string>(() => GetScriptContent(SettingsPanelDevScriptName));
        static readonly Lazy<string> _prodScript = new Lazy<string>(() => GetScriptContent(SettingsPanelScriptName));
        static readonly Lazy<string> _mapFile = new Lazy<string>(() => GetScriptContent(SettingsPanelJsMapName));


        public const string SettingsPanelDevScriptName = "settings-panel.js";
        public static string SettingsPanelDevScript => _devScript.Value;

        public const string SettingsPanelScriptName = "settings-panel.min.js";
        public static string SettingsPanelScript => _prodScript.Value;

        public const string SettingsPanelJsMapName = "settings-panel.js.map";
        public static string SettingsPanelJsMap => _mapFile.Value;

        static string GetScriptContent(string name)
        {
            var asm = Assembly.GetExecutingAssembly();
            using (var stream = asm.GetManifestResourceStream($"NFig.UI.{name}"))
            using (var reader = new StreamReader(stream))
            {
                return reader.ReadToEnd();
            }
        }
    }
}