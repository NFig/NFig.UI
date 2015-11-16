using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Jil;


namespace NFig.UI
{
    public static class NFigStoreExtensions
    {
        static readonly Options s_jsonOptions = Options.ISO8601ExcludeNullsIncludeInheritedUtcCamelCase;


        public static string GetSettingsJson<TSettings, TTier, TDataCenter>(
            this NFigStore<TSettings, TTier, TDataCenter> store,
            string applicationName,
            TTier currentTier,
            TDataCenter currentDataCenter,
            IList<TDataCenter> availableDataCenters)
            where TTier : struct
            where TDataCenter : struct
            where TSettings : class, INFigSettings<TTier, TDataCenter>, new()
        {
            if (store == null) throw new ArgumentNullException(nameof(store));

            var infos = store.GetAllSettingInfos(applicationName);
            return JSON.Serialize(
                new SettingsJsonModel<TTier, TDataCenter>(
                    currentTier,
                    currentDataCenter,
                    infos,
                    availableDataCenters),
                s_jsonOptions);
        }


        public static async Task<string> GetSettingsJsonAsync
            <TSettings, TTier, TDataCenter>(
            this NFigAsyncStore<TSettings, TTier, TDataCenter> store,
            string applicationName,
            TTier currentTier,
            TDataCenter currentDataCenter,
            IList<TDataCenter> availableDataCenters)
            where TTier : struct
            where TDataCenter : struct
            where TSettings : class, INFigSettings<TTier, TDataCenter>, new()
        {
            if (store == null) throw new ArgumentNullException(nameof(store));

            var infos = await store.GetAllSettingInfosAsync(applicationName);

            return JSON.Serialize(
                new SettingsJsonModel<TTier, TDataCenter>(
                    currentTier,
                    currentDataCenter,
                    infos,
                    availableDataCenters),
                s_jsonOptions);
        }


        public static string GetSettingJson<TSettings, TTier, TDataCenter>(
            this NFigStore<TSettings, TTier, TDataCenter> store,
            string applicationName,
            string settingName,
            TTier tier,
            TDataCenter dataCenter,
            IList<TDataCenter> availableDataCenters)
            where TTier : struct
            where TDataCenter : struct
            where TSettings : class, INFigSettings<TTier, TDataCenter>, new()
        {
            return JSON.Serialize(
                new SettingsJsonModel<TTier, TDataCenter>.Setting(
                    tier,
                    dataCenter,
                    store.GetSettingInfo(applicationName, settingName),
                    availableDataCenters),
                s_jsonOptions);
        }


        public static async Task<string> GetSettingJsonAsync
            <TSettings, TTier, TDataCenter>(
            this NFigAsyncStore<TSettings, TTier, TDataCenter> store,
            string applicationName,
            string settingName,
            TTier tier,
            TDataCenter dataCenter,
            IList<TDataCenter> availableDataCenters)
            where TTier : struct
            where TDataCenter : struct
            where TSettings : class, INFigSettings<TTier, TDataCenter>, new()
        {
            return JSON.Serialize(
                new SettingsJsonModel<TTier, TDataCenter>.Setting(
                    tier,
                    dataCenter,
                    await store.GetSettingInfoAsync(applicationName, settingName),
                    availableDataCenters),
                s_jsonOptions);
        }
    }
}