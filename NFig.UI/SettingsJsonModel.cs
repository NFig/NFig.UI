using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Reflection;

namespace NFig.UI
{
  public class SettingsJsonModel<TTier, TDataCenter>
    where TTier : struct
    where TDataCenter : struct
  {
    static readonly ConcurrentDictionary<KeyValuePair<TTier, TDataCenter>, ValueBySpecificityComparer>
      s_specificityComparers
        = new ConcurrentDictionary<KeyValuePair<TTier, TDataCenter>, ValueBySpecificityComparer>();


    [SuppressMessage("ReSharper", "UnusedMember.Local", Justification = "Used only for Jil serialization ")]
    SettingsJsonModel()
    {
    }

    public SettingsJsonModel(
      TTier tier,
      TDataCenter dataCenter,
      SettingInfo<TTier, TDataCenter>[] infos,
      IList<TDataCenter> availableDataCenters)
    {
      Settings = infos.OrderBy(i => i.Name)
        .Select(
          i => new Setting(tier, dataCenter, i, availableDataCenters))
        .ToList();

      AvailableDataCenters = availableDataCenters;
      CurrentTier = tier;
    }

    public List<Setting> Settings { get; }
    public IList<TDataCenter> AvailableDataCenters { get; }
    public TTier CurrentTier { get; }


    static ValueBySpecificityComparer GetComparerFor(TTier tier, TDataCenter dataCenter)
    {
      return s_specificityComparers.GetOrAdd(
        new KeyValuePair<TTier, TDataCenter>(tier, dataCenter),
        pair => new ValueBySpecificityComparer(tier, dataCenter)
      );
    }


    public class ValueBySpecificityComparer : IComparer<SettingValue<TTier, TDataCenter>>
    {
      readonly TDataCenter _currentDataCenter;
      readonly TTier _currentTier;


      public ValueBySpecificityComparer(TTier currentTier, TDataCenter currentDataCenter)
      {
        _currentTier = currentTier;
        _currentDataCenter = currentDataCenter;
      }


      public int Compare(SettingValue<TTier, TDataCenter> x, SettingValue<TTier, TDataCenter> y)
      {
        if (EqualityComparer<TTier>.Default.Equals(x.Tier, y.Tier) &&
            EqualityComparer<TDataCenter>.Default.Equals(x.DataCenter, y.DataCenter))
          return 0;

        if (EqualityComparer<TTier>.Default.Equals(x.Tier, _currentTier)
            && EqualityComparer<TTier>.Default.Equals(y.Tier, _currentTier))
          return -1;

        if (EqualityComparer<TTier>.Default.Equals(y.Tier, _currentTier)
            && EqualityComparer<TTier>.Default.Equals(x.Tier, _currentTier))
          return 1;

        if (EqualityComparer<TDataCenter>.Default.Equals(x.DataCenter, _currentDataCenter)
            && EqualityComparer<TDataCenter>.Default.Equals(y.DataCenter, _currentDataCenter))
          return -1;

        if (EqualityComparer<TDataCenter>.Default.Equals(y.DataCenter, _currentDataCenter)
            && EqualityComparer<TDataCenter>.Default.Equals(x.DataCenter, _currentDataCenter))
          return 1;

        if (x.IsMoreSpecificThan(y)) return -1;
        if (y.IsMoreSpecificThan(x)) return 1;

        return 0;
      }
    }

    public class Setting
    {
      // Serialization
      [SuppressMessage("ReSharper", "UnusedMember.Local")]
      Setting()
      {
      }


      internal Setting(
        TTier currentTier,
        TDataCenter currentDataCenter,
        SettingInfo<TTier, TDataCenter> info,
        IList<TDataCenter> availableDataCenters)
      {
        Name = info.Name;
        Description = info.Description;
        TypeName = info.PropertyInfo.PropertyType.FullName;
        IsEnum = info.PropertyInfo.PropertyType.IsEnum;

        var activeValue = info.GetActiveValueFor(currentTier, currentDataCenter);
        if (activeValue.IsOverride)
          ActiveOverride = activeValue;

        DefaultValue = info.GetDefaultFor(currentTier, currentDataCenter);

        var sorter = GetComparerFor(currentTier, currentDataCenter);

        AllDefaults = info.Defaults.OrderBy(v => v, sorter).ToList();
        AllOverrides = info.Overrides.OrderBy(v => v, sorter).ToList();

        if (IsEnum)
          EnumNames = EnumToDictionary(info.PropertyInfo.PropertyType);

        AllowsOverrides = availableDataCenters.ToDictionary(
          dc => dc.ToString(),
          dc => info.CanSetOverrideFor(currentTier, dc));

        RequiresRestart = Attribute.IsDefined(info.PropertyInfo, typeof(ChangeRequiresRestartAttribute));
      }

      public string Name { get; }
      public string Description { get; }
      public SettingValue<TTier, TDataCenter> ActiveOverride { get; set; }
      public SettingValue<TTier, TDataCenter> DefaultValue { get; set; }

      public string TypeName { get; }
      public bool IsEnum { get; }
      public bool RequiresRestart { get; }

      public Dictionary<string, bool> AllowsOverrides { get; }

      /// <summary>
      ///   Guaranteed to be in order of specificy
      /// </summary>
      public List<SettingValue<TTier, TDataCenter>> AllDefaults { get; }

      /// <summary>
      ///   Guaranteed to be in order of specificy
      /// </summary>
      public List<SettingValue<TTier, TDataCenter>> AllOverrides { get; }

      /// <summary>
      ///   If the type of this setting is an emum,
      ///   this property will contain the available values
      ///   for the setting
      /// </summary>
      public Dictionary<string, SettingEnumName> EnumNames { get; }


      static Dictionary<string, SettingEnumName> EnumToDictionary(Type enumType)
      {
        if (enumType == null) throw new ArgumentNullException(nameof(enumType));
        if (!enumType.IsEnum) throw new ArgumentException($"{enumType} is not an enum type", nameof(enumType));

        return Enum.GetNames(enumType).ToDictionary(
          n => Convert.ChangeType(Enum.Parse(enumType, n), enumType.GetEnumUnderlyingType()).ToString(),
          n =>
          {
            var desc = enumType.GetField(n).GetCustomAttribute<DescriptionAttribute>();
            return new SettingEnumName(n, desc?.Description);
          }
        );
      }


      public class SettingEnumName
      {
        public SettingEnumName(string name)
          : this(name, null)
        {
        }


        public SettingEnumName(string name, string description)
        {
          Name = name;
          Description = description;
        }

        public string Name { get; }
        public string Description { get; }
      }
    }
  }
}